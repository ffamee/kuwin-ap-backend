import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Building } from './entities/building.entity';
import { EntitiesService } from '../entities/entities.service';

@Injectable()
export class BuildingsService {
  constructor(
    @InjectRepository(Building)
    private buildingRepository: Repository<Building>,
    private readonly entityService: EntitiesService,
  ) {}

  findAll(): Promise<Building[]> {
    return this.buildingRepository.find();
  }

  async findOne(id: number): Promise<Building[]> {
    const buildingExist = await this.entityService.exist(id);
    if (!buildingExist) {
      throw new NotFoundException(`Building with id ${id} not found`);
    }
    return this.buildingRepository.find({
      where: { entity: { id } },
    });
  }

  exist(id: number): Promise<boolean> {
    return this.buildingRepository.exists({
      where: { id },
    });
  }
}
