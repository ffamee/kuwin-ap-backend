import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Ip } from './entities/ip.entity';
import { EntityManager, Repository } from 'typeorm';

@Injectable()
export class IpService {
  constructor(@InjectRepository(Ip) private ipRepository: Repository<Ip>) {}

  private async create(manager: EntityManager, ip: string) {
    try {
      const res: unknown = await manager.query(
        `INSERT INTO ip (ip_address)
					VALUES (?)`,
        [ip],
      );
      if (
        res &&
        typeof res === 'object' &&
        'affectedRows' in res &&
        'insertId' in res
      ) {
        const { affectedRows, insertId } = res as {
          affectedRows: number;
          insertId: number;
        };
        if (affectedRows > 0) {
          return {
            success: true,
            message: 'IP address created successfully',
            id: insertId,
          };
        }
      }
      throw new InternalServerErrorException(
        'Failed to create IP address, please try again later',
      );
    } catch (error: unknown) {
      if (error instanceof Error && 'code' in error) {
        if (error.code === 'ER_DUP_ENTRY')
          throw new ConflictException(
            'IP address already exists',
            error.message,
          );
        else if (error.code === 'ER_WRONG_VALUE_FOR_TYPE')
          throw new BadRequestException(
            'Invalid IP address format',
            error.message,
          );
        else if (error.code === 'ER_CHECK_CONSTRAINT_VIOLATED')
          throw new BadRequestException(
            'IP address does not match the required format',
            error.message,
          );
        else
          throw new InternalServerErrorException(
            'An unexpected error occurred while creating the IP address',
            error.message,
          );
      }
      throw new InternalServerErrorException(
        'An error occurred while creating the IP address',
      );
    }
  }

  // function to get IP id by IP address, if not exists, create it
  async getIp(manager: EntityManager, ip: string): Promise<number | null> {
    const existingIp = await manager.findOne(Ip, {
      where: { ip },
      select: ['id'],
    });
    if (existingIp) {
      return existingIp.id;
    } else {
      const res = await this.create(manager, ip);
      if (res && res.success && res.id) {
        return res.id;
      }
      console.error('Failed to create IP address:', res);
      return null;
    }
  }
}
