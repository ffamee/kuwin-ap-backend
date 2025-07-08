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
import { CreateEntityDto } from './dto/create-entity.dto';

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

  async getEntityOverview(sectionId: number, entityId: number) {
    const entity = await this.entityRepository.findOne({
      where: { id: entityId, section: { id: sectionId } },
    });
    if (!entity) {
      throw new NotFoundException(
        `Entity with sectionId ${sectionId} and entityId ${entityId} not found`,
      );
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

  async create(
    createEntityDto: CreateEntityDto,
    file: Express.Multer.File,
  ): Promise<Entity> {
    if (!(await this.sectionService.exist(createEntityDto.sectionId))) {
      throw new NotFoundException(
        `Section with ID ${createEntityDto.sectionId} not found`,
      );
    }
    const entity = this.entityRepository.create({
      name: createEntityDto.name,
      // timestamp: new Date()
      timestamp: new Date().toISOString(),
      url: 'tmp',
      coordinate: 'tmp',
      style: 'tmp',
      pic: file.filename,
      section: { id: createEntityDto.sectionId },
    });

    return this.entityRepository.save(entity);
  }
}
