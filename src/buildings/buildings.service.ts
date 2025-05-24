import {
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Building } from './entities/building.entity';
import { EntitiesService } from '../entities/entities.service';
import { AccesspointsService } from '../accesspoints/accesspoints.service';

@Injectable()
export class BuildingsService {
  constructor(
    @InjectRepository(Building)
    private buildingRepository: Repository<Building>,
    @Inject(forwardRef(() => EntitiesService))
    private readonly entityService: EntitiesService,
    @Inject(forwardRef(() => AccesspointsService))
    private readonly accesspointsService: AccesspointsService,
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

  async findBuildingWithApCount(entityId: number) {
    return this.buildingRepository
      .createQueryBuilder('building')
      .leftJoin('building.entity', 'entity')
      .leftJoin('building.accesspoints', 'accesspoint')
      .where('entity.id = :entityId', { entityId })
      .select('building.id', 'id')
      .addSelect('building.name', 'name')
      .addSelect('COUNT(accesspoint.id)', 'apAll')
      .addSelect(
        `COUNT(CASE WHEN accesspoint.Status = 'ma' THEN 1 END)`,
        'apMaintain',
      )
      .addSelect(
        `COUNT(CASE WHEN accesspoint.Status = 'down' THEN 1 END)`,
        'apDown',
      )
      .addSelect('SUM(accesspoint.numberClient)', 'user1')
      .addSelect('SUM(accesspoint.numberClient_2)', 'user2')
      .groupBy('building.id')
      .addGroupBy('building.name')
      .getRawMany();
  }

  async getBuildingOverview(buildingId: number) {
    const building = await this.buildingRepository.findOne({
      where: { id: buildingId },
      relations: ['accesspoints'],
    });
    if (!building) {
      throw new NotFoundException(`Building with id ${buildingId} not found`);
    }
    const [apAll, apMaintain, apDown, totalUser] = await Promise.all([
      this.accesspointsService.countAPInBuilding(buildingId),
      this.accesspointsService.countAPMaintainInBuilding(buildingId),
      this.accesspointsService.countAPDownInBuilding(buildingId),
      this.accesspointsService.sumAllClientInBuilding(buildingId),
    ]);
    return {
      id: building.id,
      name: building.name,
      apAll,
      apMaintain,
      apDown,
      totalUser,
      accesspoints: building.accesspoints,
    };
  }
}
