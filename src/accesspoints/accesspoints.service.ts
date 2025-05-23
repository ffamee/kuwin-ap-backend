import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Accesspoint } from './entities/accesspoint.entity';
import { Not, Repository } from 'typeorm';
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

  async findAllApNameInBuilding(buildingId: number): Promise<Accesspoint[]> {
    const building = await this.buildingsService.exist(buildingId);
    if (!building) {
      throw new NotFoundException('Building not found');
    }
    return this.accesspointRepository.find({
      where: { buildingId },
      select: {
        id: true,
        name: true,
      },
    });
  }

  async sumAllClientInSection(section: string): Promise<number> {
    const [sumCl, sumCl2] = await Promise.all([
      (await this.accesspointRepository.sum('numberClient', {
        building: { entity: { section: { name: section } } },
      })) ?? 0,
      (await this.accesspointRepository.sum('numberClient_2', {
        building: { entity: { section: { name: section } } },
      })) ?? 0,
    ]);
    return sumCl + sumCl2;
  }

  async countAPInSection(section: string): Promise<number> {
    return this.accesspointRepository.count({
      where: { building: { entity: { section: { name: section } } } },
    });
  }

  async countAPMaintainInSection(section: string): Promise<number> {
    return this.accesspointRepository.count({
      where: {
        building: { entity: { section: { name: section } } },
        status: 'ma',
      },
    });
  }

  async countAPDownInSection(section: string): Promise<number> {
    return this.accesspointRepository.count({
      where: {
        building: { entity: { section: { name: section } } },
        status: 'down',
      },
    });
  }

  async countAPInEntity(entityId: number): Promise<number> {
    return this.accesspointRepository.count({
      where: { building: { entity: { id: entityId } } },
    });
  }

  async countAPMaintainInEntity(entityId: number): Promise<number> {
    return this.accesspointRepository.count({
      where: {
        building: { entity: { id: entityId } },
        status: 'ma',
      },
    });
  }

  async countAPDownInEntity(entityId: number): Promise<number> {
    return this.accesspointRepository.count({
      where: {
        building: { entity: { id: entityId } },
        status: 'down',
      },
    });
  }

  async countAPWithWlCInEntity(entityId: number): Promise<number> {
    return this.accesspointRepository.count({
      where: {
        building: { entity: { id: entityId } },
        wlc: Not('No'),
      },
    });
  }

  async sumClientInEntity(entityId: number): Promise<number> {
    const [sumCl, sumCl2] = await Promise.all([
      (await this.accesspointRepository.sum('numberClient', {
        building: { entity: { id: entityId } },
      })) ?? 0,
      (await this.accesspointRepository.sum('numberClient_2', {
        building: { entity: { id: entityId } },
      })) ?? 0,
    ]);
    return sumCl + sumCl2;
  }
}
