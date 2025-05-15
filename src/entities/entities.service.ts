import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Entity } from './entities/entity.entity';
import { Repository } from 'typeorm';
import { SectionService } from '../section/section.service';

@Injectable()
export class EntitiesService {
  constructor(
    @InjectRepository(Entity)
    private entityRepository: Repository<Entity>,
    private readonly sectionService: SectionService,
  ) {}
  // create(createEntityDto: CreateEntityDto) {
  //   return 'This action adds a new entity';
  // }

  exist(id: number): Promise<boolean> {
    return this.entityRepository.exists({ where: { id } });
  }

  async findOne(section: string): Promise<Entity[]> {
    // find all entities by section.secType
    const sectionExists = await this.sectionService.exist(section);
    if (!sectionExists) {
      throw new NotFoundException(`Section with id ${section} not found`);
    }
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
