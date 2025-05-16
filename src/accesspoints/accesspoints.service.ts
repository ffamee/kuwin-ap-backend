import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Accesspoint } from './entities/accesspoint.entity';
import { Repository } from 'typeorm';
import { BuildingsService } from '../buildings/buildings.service';

@Injectable()
export class AccesspointsService {
  constructor(
    @InjectRepository(Accesspoint)
    private accesspointRepository: Repository<Accesspoint>,
    private readonly buildingsService: BuildingsService,
  ) {}

  findAll(): Promise<Accesspoint[]> {
    return this.accesspointRepository.find();
  }

  async findAllApInBuilding(buildingId: number): Promise<Accesspoint[]> {
    const building = await this.buildingsService.exist(buildingId);
    if (!building) {
      throw new NotFoundException('Building not found');
    }
    return this.accesspointRepository.find({
      where: { buildingId },
    });
  }

  async findOne(id: number): Promise<Accesspoint> {
    const accesspoint = await this.accesspointRepository.findOne({
      where: { id },
    });
    if (!accesspoint) {
      throw new NotFoundException(`Access point with id ${id} not found`);
    }
    return accesspoint;
  }
}
