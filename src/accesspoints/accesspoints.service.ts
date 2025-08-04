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

  private async create(manager: EntityManager, radMac: string, host: string) {
    try {
      const session = snmp.createSession(host, 'KUWINTEST', {
        version: snmp.Version['2c'],
      });
      const decMac = this.macToDec(radMac);
      const oids = [
        '1.3.6.1.4.1.14179.2.2.1.1.3' + '.' + decMac, // ap name
        '1.3.6.1.4.1.14179.2.2.1.1.16' + '.' + decMac, // model
        '1.3.6.1.4.1.14179.2.2.1.1.17' + '.' + decMac, // serial
        '1.3.6.1.4.1.14179.2.2.1.1.31' + '.' + decMac, // ios version
        '1.3.6.1.4.1.14179.2.2.1.1.33' + '.' + decMac, // eth mac
      ];
      const [name, model, serial, ios, ethMac] = await Promise.all(
        oids.map((oid) => get(session, oid)),
      );
      const ap = manager.create(Accesspoint, {
        name: Buffer.from(name as string, 'utf-8').toString('utf-8'),
        model: Buffer.from(model as string, 'utf-8').toString('utf-8'),
        serial: Buffer.from(serial as string, 'utf-8').toString('utf-8'),
        ios: Buffer.from(ios as string, 'utf-8').toString('utf-8'),
        radMac: radMac,
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
    radMac: string,
    host: string,
  ): Promise<number | null> {
    const existingAp = await manager.findOne(Accesspoint, {
      where: { radMac },
      select: ['id'],
    });
    if (existingAp) {
      return existingAp.id;
    } else {
      const res = await this.create(manager, radMac, host);
      if (res instanceof Accesspoint) {
        return res.id;
      }
      console.error('Failed to create AP:', res);
      return null;
    }
  }
}
