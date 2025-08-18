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
import { CreateEntityDto } from './dto/create-entity.dto';
import { Building } from '../buildings/entities/building.entity';
import { UpdateEntityDto } from './dto/update-entity.dto';
import { ConfigService } from '@nestjs/config';
import { deleteFile, saveFile } from 'src/shared/utils/file-system';
import { InfluxService } from 'src/influx/influx.service';
import { RawEntity, OutputEntity } from '../shared/types/entity-raw.dto';
import {
  c24Count,
  c5Count,
  c6Count,
  configCount,
  downCount,
  maCount,
} from 'src/shared/sql-query/query';
@Injectable()
export class EntitiesService {
  constructor(
    private dataSource: DataSource,
    private readonly configService: ConfigService,
    @Inject(forwardRef(() => InfluxService))
    private readonly influxService: InfluxService,
    @InjectRepository(Entity)
    private entityRepository: Repository<Entity>,
    @Inject(forwardRef(() => SectionService))
    private readonly sectionService: SectionService,
  ) {}

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

  async getEntityOverview(sectionId: number, entityId: number) {
    const [entity, num, numEach] = await Promise.all([
      this.entityRepository
        .query(
          `
				SELECT e.id AS entity_id, e.name AS entity_name, b.id AS building_id, b.name AS building_name,
					loc.location_id , loc.location_name , loc.configuration_id , loc.created_at , loc.last_seen_at ,
					loc.status , loc.client_24 , loc.client_5 , loc.client_6 , loc.rx , loc.tx ,
					a.id AS accesspoint_id, a.name AS accesspoint_name,
					i.id AS ip_id, i.ip_address
				FROM entity e
				LEFT JOIN section s ON s.id = e.sectionId
				LEFT JOIN building b on b.entityId = e.id
				LEFT JOIN (
					SELECT l.id AS location_id, l.location_name, l.buildingId AS location_building_id,
						c.id AS configuration_id, c.created_at, c.last_seen_at, c.status,
						c.client_24 , c.client_5, c.client_6, c.rx , c.tx,
						c.accesspointId, c.ipId
					FROM location l
					INNER JOIN configuration c ON c.locationId = l.id ) loc ON loc.location_building_id = b.id
				LEFT JOIN accesspoint a ON loc.accesspointId  = a.id
				LEFT JOIN ip i ON loc.ipId = i.id
				WHERE e.id = ? AND s.id = ?`,
          [entityId, sectionId],
        )
        .then((raws: RawEntity[]) =>
          raws.reduce((acc, row) => {
            acc.id = row.entity_id;
            acc.name = row.entity_name;
            if (!acc.buildings) {
              acc.buildings = [];
            }
            if (row.building_id && row.building_name) {
              let existingBuilding = acc.buildings.find(
                (b) => b.id === row.building_id,
              );
              if (!existingBuilding) {
                existingBuilding = {
                  id: row.building_id,
                  name: row.building_name,
                  configurations: [],
                };
                acc.buildings.push(existingBuilding);
              }
              if (row.configuration_id && row.created_at && row.last_seen_at) {
                existingBuilding.configurations.push({
                  id: row.configuration_id,
                  createdAt: row.created_at,
                  lastSeenAt: row.last_seen_at,
                  status: row.status,
                  client24: row.client_24,
                  client5: row.client_5,
                  client6: row.client_6,
                  rx: row.rx,
                  tx: row.tx,
                  accesspoint:
                    row.accesspoint_id && row.accesspoint_name
                      ? { id: row.accesspoint_id, name: row.accesspoint_name }
                      : null,
                  ip:
                    row.ip_id && row.ip_address
                      ? { id: row.ip_id, ip: row.ip_address }
                      : null,
                  location:
                    row.location_id && row.location_name
                      ? {
                          id: row.location_id,
                          name: row.location_name,
                        }
                      : null,
                });
              }
            }
            return acc;
          }, {} as OutputEntity),
        )
        .catch((error: unknown) => {
          if (error instanceof Error) {
            throw new InternalServerErrorException(
              `Failed to fetch entity overview: ${error.message}`,
            );
          }
          throw new InternalServerErrorException(
            'Error occurred while fetching entity overview',
          );
        }),
      this.entityRepository
        .createQueryBuilder('entity')
        .leftJoin('entity.section', 'section')
        .leftJoin('entity.buildings', 'building')
        .leftJoin('building.locations', 'location')
        .leftJoin('location.configuration', 'configuration')
        .select(configCount, 'configCount')
        .addSelect(downCount, 'downCount')
        .addSelect(maCount, 'maCount')
        .addSelect(c24Count, 'c24Count')
        .addSelect(c5Count, 'c5Count')
        .addSelect(c6Count, 'c6Count')
        .where('entity.id = :entityId', { entityId })
        .andWhere('section.id = :sectionId', { sectionId })
        .getRawOne<{
          configCount: number;
          downCount: number;
          maCount: number;
          c24Count: number;
          c5Count: number;
          c6Count: number;
        }>(),
      this.entityRepository
        .createQueryBuilder('entity')
        .leftJoin('entity.section', 'section')
        .leftJoin('entity.buildings', 'building')
        .leftJoin('building.locations', 'location')
        .leftJoin('location.configuration', 'configuration')
        .select('building.id', 'buildingId')
        .addSelect(configCount, 'configCount')
        .addSelect(downCount, 'downCount')
        .addSelect(maCount, 'maCount')
        .addSelect(c24Count, 'c24Count')
        .addSelect(c5Count, 'c5Count')
        .addSelect(c6Count, 'c6Count')
        .where('entity.id = :entityId', { entityId })
        .andWhere('section.id = :sectionId', { sectionId })
        .groupBy('building.id')
        .getRawMany<{
          buildingId: number;
          configCount: number;
          downCount: number;
          maCount: number;
          c24Count: number;
          c5Count: number;
          c6Count: number;
        }>(),
    ]);
    if (!entity || Object.keys(entity).length === 0 || !num || !numEach) {
      throw new NotFoundException(
        `Entity with sectionId ${sectionId} and entityId ${entityId} not found`,
      );
    }
    return {
      ...entity,
      buildings: entity.buildings.flatMap((building) => {
        const e = numEach.find((b) => b.buildingId === building.id);
        const { buildingId: _, ...rest } = e || {};
        if (e) return { ...building, ...rest };
        return building;
      }),
      ...num,
    };
  }

  async create(
    createEntityDto: CreateEntityDto,
    file: Express.Multer.File | undefined,
  ): Promise<{ id: number; name: string }> {
    if (!(await this.sectionService.exist(createEntityDto.sectionId))) {
      throw new NotFoundException(
        `Section with ID ${createEntityDto.sectionId} not found`,
      );
    }
    if (
      await this.entityRepository.exists({
        where: { name: createEntityDto.name },
      })
    ) {
      throw new ConflictException(
        `Entity with name ${createEntityDto.name} already exists`,
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

    const res = await this.entityRepository.save(entity);
    return { id: res.id, name: res.name };
  }

  async remove(id: number, confirm: boolean) {
    try {
      return await this.dataSource.transaction(async (manager) => {
        const entity = await manager.findOne(Entity, {
          where: { id },
          relations: ['buildings'],
          lock: { mode: 'pessimistic_write' },
        });
        if (entity) {
          if (entity.buildings.length > 0) {
            if (confirm) {
              await manager.update(
                Building,
                { entity: { id } },
                { entity: { id: 123 } }, // Move buildings to default entity
              );
            } else {
              throw new ConflictException(
                `Entity with id ${id} cannot be deleted because it has associated buildings, please confirm to proceed`,
              );
            }
          }
          await deleteFile(entity.pic);
          return await manager.delete(Entity, { id }).then(() => {
            return {
              message: `Entity with ID ${id} moved buildings to default entity and deleted successfully`,
            };
          });
        } else {
          throw new NotFoundException(`Entity with id ${id} not found`);
        }
      });
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error; // rethrow NotFoundException
      }
      if (error instanceof ConflictException) {
        throw error; // rethrow ConflictException
      }
      throw new InternalServerErrorException(
        `Entity with id ${id} cannot be deleted because ${error}`,
      );
    }
  }

  async edit(
    id: number,
    updateEntityDto: UpdateEntityDto,
    confirm: boolean,
    file: Express.Multer.File | undefined,
  ) {
    if (!(await this.entityRepository.exists({ where: { id } }))) {
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
      !(await this.sectionService.exist(updateEntityDto.sectionId))
    ) {
      throw new NotFoundException(
        `Section with ID ${updateEntityDto.sectionId} not found`,
      );
    }

    // start transaction
    try {
      return await this.dataSource.transaction(async (manager) => {
        const entity = await manager.findOne(Entity, {
          where: { id },
          relations: ['section', 'buildings'],
          lock: { mode: 'pessimistic_write' },
        });
        if (entity) {
          if (
            updateEntityDto.sectionId &&
            updateEntityDto.sectionId !== entity.section.id &&
            entity.buildings.length > 0 &&
            !confirm
          ) {
            throw new ConflictException(
              `This action will change entity of section ID ${id} to section with ID ${updateEntityDto.sectionId}. Please confirm to proceed.`,
            );
          }
          let filename = entity.pic;
          if (file) {
            await deleteFile(entity.pic);
            filename = await saveFile(this.configService, file, 'entities');
          }
          const { sectionId, ...rest } = updateEntityDto;
          return manager.save(Entity, {
            id: id,
            ...(file && { pic: filename }),
            ...(sectionId && { section: { id: sectionId } }),
            ...rest,
          });
        } else {
          throw new NotFoundException(`Entity with ID ${id} not found`);
        }
      });
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error; // rethrow NotFoundException
      }
      if (error instanceof ConflictException) {
        throw error; // rethrow ConflictException
      }
      throw new InternalServerErrorException(
        `Failed to update entity ID ${id} with error: ${error}`,
      );
    }
  }
}
