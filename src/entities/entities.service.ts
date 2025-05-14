import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Entity } from './entities/entity.entity';
import { Repository } from 'typeorm';

@Injectable()
export class EntitiesService {
  constructor(
    @InjectRepository(Entity)
    private readonly entityRepository: Repository<Entity>,
  ) {}
  // create(createEntityDto: CreateEntityDto) {
  //   return 'This action adds a new entity';
  // }

  async findOne(section: string): Promise<Entity[]> {
    const entities = await this.entityRepository.find({
      where: { section: { secType: section } },
    });
    return entities;
  }

  findAll(): Promise<Entity[][]> {
    // return all entities grouped by section.secType
    return Promise.all([
      this.entityRepository.find({
        where: { section: { secType: 'faculty' } },
        relations: ['section'],
      }),
      this.entityRepository.find({
        where: { section: { secType: 'organization' } },
        relations: ['section'],
      }),
      this.entityRepository.find({
        where: { section: { secType: 'dormitory' } },
        relations: ['section'],
      }),
    ]);
  }
}
