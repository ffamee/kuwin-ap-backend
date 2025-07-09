import {
  ConflictException,
  forwardRef,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Entity } from './entities/entity.entity';
import { DataSource, Not, Repository } from 'typeorm';
import { SectionService } from '../section/section.service';
import { AccesspointsService } from '../accesspoints/accesspoints.service';
import { BuildingsService } from '../buildings/buildings.service';
import { CreateEntityDto } from './dto/create-entity.dto';
import { Building } from '../buildings/entities/building.entity';
import { UpdateEntityDto } from './dto/update-entity.dto';
import { Section } from 'src/section/entities/section.entity';
import { ConfigService } from '@nestjs/config';
import { deleteFile, saveFile } from 'src/shared/utils/file-system';

@Injectable()
export class EntitiesService {
  constructor(
    private dataSource: DataSource,
    private readonly configService: ConfigService,
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
    file: Express.Multer.File | undefined,
  ): Promise<Entity> {
    if (!(await this.sectionService.exist(createEntityDto.sectionId))) {
      throw new NotFoundException(
        `Section with ID ${createEntityDto.sectionId} not found`,
      );
    }
    const filename = file
      ? await saveFile(this.configService, file, 'entities')
      : 'default.png';
    const entity = this.entityRepository.create({
      name: createEntityDto.name,
      // timestamp: new Date()
      timestamp: new Date().toISOString(),
      url: 'tmp',
      coordinate: 'tmp',
      style: 'tmp',
      pic: filename,
      section: { id: createEntityDto.sectionId },
    });

    return this.entityRepository.save(entity);
  }

  async remove(id: number) {
    const entity = await this.entityRepository.findOne({
      where: { id },
      relations: ['buildings'],
    });
    if (!entity) {
      throw new NotFoundException(`Entity with ID ${id} not found`);
    }
    if (entity.buildings.length > 0) {
      throw new ConflictException(
        `Entity with ID ${id} has associated buildings and cannot be deleted`,
      );
    }
    await deleteFile(entity.pic);
    return await this.entityRepository.delete(id).then(() => {
      return { message: `Entity with ID ${id} deleted successfully` };
    });
  }

  async moveAndDelete(id: number) {
    try {
      await this.dataSource.transaction(async (manager) => {
        const entity = await manager.findOne(Entity, {
          where: { id },
          lock: { mode: 'pessimistic_write' },
        });
        if (entity) {
          await deleteFile(entity.pic);
          await manager.update(
            Building,
            { entity: { id } },
            { entity: { id: 123 } },
          );
          await manager.delete(Entity, { id });
          return {
            message: `Entity with ID ${id} moved buildings to default entity and deleted successfully`,
          };
        } else {
          throw new NotFoundException(`Entity with id ${id} not found`);
        }
      });
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error; // rethrow NotFoundException
      }
      throw new InternalServerErrorException(
        `Section with id ${id} cannot be deleted because ${error}`,
      );
    }
  }

  async edit(
    id: number,
    updateEntityDto: UpdateEntityDto,
    confirm: boolean,
    file: Express.Multer.File | undefined,
  ) {
    const entity = await this.entityRepository.findOne({
      where: { id },
      relations: ['section'],
    });
    if (!entity) {
      throw new NotFoundException(`Entity with ID ${id} not found`);
    }
    if (
      updateEntityDto.name &&
      (await this.entityRepository.exists({
        where: { name: updateEntityDto.name, id: Not(id) },
      }))
    ) {
      throw new ConflictException(
        `Entity with name ${updateEntityDto.name} already exists`,
      );
    }
    if (
      updateEntityDto.sectionId &&
      updateEntityDto.sectionId !== entity.section.id
    ) {
      // warning: this action will move entity to another section, please confirm
      if (!confirm) {
        throw new ConflictException(
          `This action will change entity of section ID ${id} to section with ID ${updateEntityDto.sectionId}. Please confirm to proceed.`,
        );
      } else {
        // use transaction to ensure atomicity
        try {
          await this.dataSource.transaction(async (manager) => {
            const entity = await manager.findOne(Entity, {
              where: { id },
              lock: { mode: 'pessimistic_write' },
            });
            if (entity) {
              if (
                !(await manager.exists(Section, {
                  where: { id: updateEntityDto.sectionId },
                }))
              ) {
                throw new NotFoundException(
                  `Section with ID ${updateEntityDto.sectionId} not found`,
                );
              }
              const { sectionId, ...rest } = updateEntityDto;
              let filename = entity.pic;
              if (file) {
                await deleteFile(entity.pic);
                filename = await saveFile(this.configService, file, 'entities');
              }
              await manager.update(Entity, id, {
                ...rest,
                pic: filename,
                section: { id: sectionId },
              });
            } else {
              throw new NotFoundException(`Entity with ID ${id} not found`);
            }
          });
        } catch (error) {
          if (error instanceof NotFoundException) {
            throw error; // rethrow NotFoundException
          }
          throw new InternalServerErrorException(
            `Failed to update entity ID ${id} with error: ${error}`,
          );
        }
      }
    } else {
      let filename = entity.pic;
      if (file) {
        await deleteFile(entity.pic);
        filename = await saveFile(this.configService, file, 'entities');
      }
      return this.entityRepository
        .update(id, { ...updateEntityDto, pic: filename })
        .then(() => {
          return { message: `Entity with ID ${id} updated successfully` };
        });
    }
  }
}
