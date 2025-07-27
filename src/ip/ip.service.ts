import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Ip } from './entities/ip.entity';
import { Repository } from 'typeorm';

@Injectable()
export class IpService {
  constructor(@InjectRepository(Ip) private ipRepository: Repository<Ip>) {}

  private async create(ip: string) {
    try {
      const res = (await this.ipRepository.query(
        `INSERT INTO ip (ip_address)
					VALUES (?)`,
        [ip],
      )) as { affectedRows: number; insertId: number };
      if (res.affectedRows > 0) {
        return {
          success: true,
          message: 'IP address created successfully',
          id: res.insertId,
        };
      }
    } catch (error: unknown) {
      if (error instanceof Error && 'code' in error) {
        if (error.code === 'ER_DUP_ENTRY')
          return {
            success: false,
            message: 'IP address already exists',
            detail: error.message,
          };
        else if (error.code === 'ER_WRONG_VALUE_FOR_TYPE')
          return {
            success: false,
            message: 'Invalid IP address format',
            detail: error.message,
          };
        else if (error.code === 'ER_CHECK_CONSTRAINT_VIOLATED')
          return {
            success: false,
            message: 'IP address does not meet the required constraints',
            detail: error.message,
          };
      }
      console.error('Error creating IP address:', error);
      return null;
    }
  }

  // function to get IP id by IP address, if not exists, create it
  async getIp(ip: string): Promise<number | null> {
    const existingIp = await this.ipRepository.findOne({
      where: { ip },
      select: ['id'],
    });
    if (existingIp) {
      return existingIp.id;
    } else {
      const res = await this.create(ip);
      if (res && res.success && res.id) {
        return res.id;
      }
      console.error('Failed to create IP address:', res);
      return null;
    }
  }
}
