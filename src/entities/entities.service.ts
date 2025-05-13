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

  findAll() {
    return `This action returns all entities`;
  }
}
