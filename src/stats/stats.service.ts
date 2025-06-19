import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Stat } from './entities/stat.entity';
import { Repository } from 'typeorm';

@Injectable()
export class StatsService {
  constructor(
    @InjectRepository(Stat) private statRepository: Repository<Stat>,
  ) {}

  findAll(): Promise<{ year: number; month: number; uptime: number }[]> {
    return this.statRepository
      .createQueryBuilder('stat')
      .select('stat.year', 'year')
      .addSelect('stat.month', 'month')
      .addSelect('sum(stat.uptime)', 'uptime')
      .addSelect('sum(stat.totaltime)', 'totaltime')
      .addSelect('count(stat.id)', 'count')
      .groupBy('stat.year')
      .addGroupBy('stat.month')
      .orderBy('stat.year', 'DESC')
      .addOrderBy('stat.month', 'DESC')
      .getRawMany();
  }
}
