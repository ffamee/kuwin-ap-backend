import {
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Entity } from './entities/entity.entity';
import { Repository } from 'typeorm';
import { SectionService } from '../section/section.service';
import { AccesspointsService } from '../accesspoints/accesspoints.service';
import { BuildingsService } from 'src/buildings/buildings.service';

@Injectable()
export class EntitiesService {
  constructor(
    @InjectRepository(Entity)
    private entityRepository: Repository<Entity>,
    @Inject(forwardRef(() => SectionService))
    private readonly sectionService: SectionService,
    @Inject(forwardRef(() => BuildingsService))
    private readonly buildingsService: BuildingsService,
    @Inject(forwardRef(() => AccesspointsService))
    private readonly accesspointsService: AccesspointsService,
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
      where: { section: { name: section } },
    });
    return entities;
  }

  async findAll(): Promise<{
    faculty: Entity[];
    organization: Entity[];
    dormitory: Entity[];
  }> {
    // return all entities grouped by section.secType
    const [faculty, organization, dormitory]: [Entity[], Entity[], Entity[]] =
      await Promise.all([
        this.entityRepository.find({
          where: { section: { name: 'faculty' } },
          relations: { buildings: true },
        }),
        this.entityRepository.find({
          where: { section: { name: 'organization' } },
          relations: { buildings: true },
        }),
        this.entityRepository.find({
          where: { section: { name: 'dormitory' } },
          relations: { buildings: true },
        }),
      ]);
    return { faculty, organization, dormitory };
  }

  async findAllName(): Promise<Record<string, Entity>> {
    const res = await this.entityRepository.find({
      select: {
        id: true,
        name: true,
        buildings: {
          id: true,
          name: true,
        },
      },
      relations: { buildings: true },
    });

    const entities: Record<string, Entity> = res.reduce(
      (acc, entity) => {
        acc[entity.id.toString()] = entity;
        return acc;
      },
      {} as Record<string, Entity>,
    );

    return entities;
  }

  async findEntitiesWithApCount(section: number) {
    return this.entityRepository
      .createQueryBuilder('entity')
      .leftJoin('entity.section', 'section')
      .leftJoin('entity.buildings', 'building')
      .leftJoin('building.accesspoints', 'accesspoint')
      .where('section.id = :section', { section })
      .select('entity.id', 'id')
      .addSelect('entity.name', 'name')
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
      .groupBy('entity.id')
      .addGroupBy('entity.name')
      .getRawMany();
  }

  async getEntityOverview(entityId: number) {
    const entity = await this.entityRepository.findOne({
      where: { id: entityId },
    });
    if (!entity) {
      throw new NotFoundException(`Entity with id ${entityId} not found`);
    }
    const [apAll, apMaintain, apDown, totalUser, buildings, accesspoints] =
      await Promise.all([
        this.accesspointsService.countAPInEntity(entityId),
        this.accesspointsService.countAPMaintainInEntity(entityId),
        this.accesspointsService.countAPDownInEntity(entityId),
        this.accesspointsService.sumAllClientInEntity(entityId),
        this.buildingsService.findBuildingWithApCount(entityId),
        this.accesspointsService.findOverviewApInEntityGroupByBuilding(
          entityId,
        ),
      ]);
    return {
      id: entity.id,
      name: entity.name,
      apAll,
      apMaintain,
      apDown,
      totalUser,
      buildings,
      accesspoints,
    };
  }
}
