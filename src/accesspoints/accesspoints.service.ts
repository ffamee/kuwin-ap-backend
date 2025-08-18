import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Accesspoint } from './entities/accesspoint.entity';
import { DataSource, EntityManager, Repository } from 'typeorm';
import * as snmp from 'net-snmp';
import { get } from 'src/shared/utils/snmp';
import { oids } from 'src/shared/defined/oid';
// import { ErrorState } from 'src/shared/types/define-state';

@Injectable()
export class AccesspointsService {
  constructor(
    private dataSource: DataSource,
    @InjectRepository(Accesspoint)
    private accesspointRepository: Repository<Accesspoint>,
  ) {}

  private macToDec(mac: string): string {
    return mac
      .split(':')
      .map((octet) => parseInt(octet, 16))
      .join('.');
  }

  private async create(
    manager: EntityManager,
    vendor: string,
    mac: string,
    host: string,
  ) {
    try {
      const session = snmp.createSession(host, 'KUWINTEST', {
        version: snmp.Version['2c'],
      });
      const decMac = this.macToDec(mac);
      const list = oids[vendor as keyof typeof oids];
      const oid = [
        list.apNameBaseOid.oid + '.' + decMac, // ap name
        list.apModelBaseOid.oid + '.' + decMac, // model
        list.apSerialBaseOid.oid + '.' + decMac, // serial
        list.apIosBaseOid.oid + '.' + decMac, // ios version
        list.apEthMacBaseOid.oid + '.' + decMac, // eth mac
        list.apRadMacBaseOid.oid +
          '.' +
          decMac +
          `${vendor === 'cisco' ? '' : '.1'}`, // rad mac
      ];
      const [name, model, serial, ios, ethMac, radMac] = await Promise.all(
        oid.map((o) => get(session, o)),
      );
      const ap = manager.create(Accesspoint, {
        name: Buffer.from(name as string, 'utf-8').toString('utf-8'),
        model: Buffer.from(model as string, 'utf-8').toString('utf-8'),
        serial: Buffer.from(serial as string, 'utf-8').toString('utf-8'),
        ios: Buffer.from(ios as string, 'utf-8').toString('utf-8'),
        radMac: Buffer.from(radMac as string, 'hex')
          .toString('hex')
          .replace(/(.{2})(?=.)/g, '$1:'),
        ethMac: Buffer.from(ethMac as string, 'hex')
          .toString('hex')
          .replace(/(.{2})(?=.)/g, '$1:'),
      });
      const res = await manager.save(ap);
      if (res) {
        return res;
      }
      throw new InternalServerErrorException(
        'Failed to create access point, please try again later',
      );
    } catch (error: unknown) {
      if (error instanceof Error && 'code' in error) {
        if (error.code === 'ER_DUP_ENTRY')
          throw new ConflictException(
            'Access point already exists',
            error.message,
          );
        else
          throw new InternalServerErrorException(
            'An unexpected error occurred while creating the access point',
            error.message,
          );
      } else if (error instanceof InternalServerErrorException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'An error occurred while creating the access point',
      );
    }
  }

  // function to get AP id by MAC address, if not exists, create it
  async getAp(
    manager: EntityManager,
    vendor: string,
    mac: string,
    host: string,
  ): Promise<number | null> {
    const cond = vendor === 'cisco' ? 'radMac' : 'ethMac';
    const existingAp = await manager.findOne(Accesspoint, {
      where: { [cond]: mac },
      select: ['id'],
    });
    if (existingAp) {
      return existingAp.id;
    } else {
      const res = await this.create(manager, vendor, mac, host);
      if (res instanceof Accesspoint) {
        return res.id;
      }
      console.error('Failed to create AP:', res);
      return null;
    }
  }
}
