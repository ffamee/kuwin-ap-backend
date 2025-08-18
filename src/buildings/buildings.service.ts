import {
  ConflictException,
  forwardRef,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Not, Repository } from 'typeorm';
import { Building } from './entities/building.entity';
import { EntitiesService } from '../entities/entities.service';
import { CreateBuildingDto } from './dto/create-building.dto';
import { UpdateBuildingDto } from './dto/update-building.dto';
import { ConfigService } from '@nestjs/config';
import { deleteFile, saveFile } from 'src/shared/utils/file-system';
import { InfluxService } from 'src/influx/influx.service';
import { Location } from 'src/locations/entities/location.entity';
import {
  c24Count,
  c5Count,
  c6Count,
  configCount,
  downCount,
  maCount,
} from 'src/shared/sql-query/query';
import { OutputBuilding, RawBuilding } from 'src/shared/types/building-raw.dto';

@Injectable()
export class BuildingsService {
  constructor(
    private dataSource: DataSource,
    private readonly configService: ConfigService,
    @Inject(forwardRef(() => InfluxService))
    private readonly influxService: InfluxService,
    @InjectRepository(Building)
    private buildingRepository: Repository<Building>,
    @Inject(forwardRef(() => EntitiesService))
    private readonly entityService: EntitiesService,
  ) {}

  findAll(): Promise<Building[]> {
    return this.buildingRepository.find();
  }

  exist(id: number): Promise<boolean> {
    return this.buildingRepository.exists({
      where: { id },
    });
  }

  async getBuildingOverview(
    sectionId: number,
    entityId: number,
    buildingId: number,
  ) {
    // join location and then join location to configuration and count *
    const [building, num] = await Promise.all([
      this.buildingRepository
        .query(
          `SELECT b.id AS building_id, b.name AS building_name,
						loc.location_id , loc.location_name , loc.configuration_id , loc.created_at , loc.last_seen_at ,
						loc.status , loc.client_24 , loc.client_5 , loc.client_6 , loc.rx , loc.tx ,
						a.id AS accesspoint_id, a.name AS accesspoint_name,
						i.id AS ip_id, i.ip_address
					FROM building b
					LEFT JOIN entity e ON e.id = b.entityId
					LEFT JOIN section s ON s.id = e.sectionId
					LEFT JOIN (
						SELECT l.id AS location_id, l.location_name, l.buildingId AS location_building_id,
							c.id AS configuration_id, c.created_at, c.last_seen_at, c.status,
							c.client_24 , c.client_5, c.client_6, c.rx , c.tx,
							c.accesspointId, c.ipId
						FROM location l
						INNER JOIN configuration c ON c.locationId = l.id ) loc ON loc.location_building_id = b.id
					LEFT JOIN accesspoint a ON loc.accesspointId  = a.id
					LEFT JOIN ip i ON loc.ipId = i.id
					WHERE s.id = ? AND e.id = ? AND b.id = ?`,
          [sectionId, entityId, buildingId],
        )
        .then((raws: RawBuilding[]) =>
          raws.reduce((acc, row) => {
            acc.id = row.building_id;
            acc.name = row.building_name;
            if (!acc.configurations) {
              acc.configurations = [];
            }
            if (row.configuration_id && row.created_at && row.last_seen_at) {
              acc.configurations.push({
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
            return acc;
          }, {} as OutputBuilding),
        )
        .catch((error: unknown) => {
          if (error instanceof Error) {
            throw new InternalServerErrorException(
              `Failed to fetch building overview: ${error.message}`,
            );
          }
          throw new InternalServerErrorException(
            'Error occurred while fetching building overview',
          );
        }),
      this.buildingRepository
        .createQueryBuilder('building')
        .leftJoin('building.entity', 'entity')
        .leftJoin('entity.section', 'section')
        .leftJoin('building.locations', 'location')
        .leftJoin('location.configuration', 'configuration')
        .select(configCount, 'configCount')
        .addSelect(downCount, 'downCount')
        .addSelect(maCount, 'maCount')
        .addSelect(c24Count, 'c24Count')
        .addSelect(c5Count, 'c5Count')
        .addSelect(c6Count, 'c6Count')
        .where('building.id = :buildingId', { buildingId })
        .andWhere('entity.id = :entityId', { entityId })
        .andWhere('section.id = :sectionId', { sectionId })
        // .andWhere('configuration.id IS NOT NULL')
        .getRawOne<{
          configCount: number;
          downCount: number;
          maCount: number;
          c24Count: number;
          c5Count: number;
          c6Count: number;
        }>(),
    ]);
    if (!building || Object.keys(building).length === 0 || !num) {
      throw new NotFoundException(
        `Building with id ${buildingId} in entity ${entityId} and section ${sectionId} not found`,
      );
    }
    return {
      ...building,
      ...num,
    };
  }

  async create(
    createBuildingDto: CreateBuildingDto,
    file: Express.Multer.File | undefined,
  ): Promise<{ id: number; name: string }> {
    if (!(await this.entityService.exist(createBuildingDto.entityId))) {
      throw new NotFoundException(
        `Entity with ID ${createBuildingDto.entityId} not found`,
      );
    }
    if (
      await this.buildingRepository.exists({
        where: {
          name: createBuildingDto.name,
          entity: { id: createBuildingDto.entityId },
        },
      })
    ) {
      throw new ConflictException(
        `Building with name ${createBuildingDto.name} already exists`,
      );
    }
    const filename = file
      ? await saveFile(this.configService, file, 'buildings')
      : 'default.png';
    const building = this.buildingRepository.create({
      name: createBuildingDto.name,
      comment: createBuildingDto.comment,
      pic: filename,
      entity: { id: createBuildingDto.entityId },
    });
    const res = await this.buildingRepository.save(building);
    return { id: res.id, name: res.name };
  }

  async remove(id: number, confirm: boolean) {
    try {
      return this.dataSource.transaction(async (manager) => {
        const building = await manager.findOne(Building, {
          where: { id },
          relations: ['locations'],
          lock: { mode: 'pessimistic_write' },
        });
        if (building) {
          if (building.locations.length > 0) {
            if (confirm) {
              await manager.update(
                Location,
                { building: { id } },
                { building: { id: 290 } }, // Move locations to default building with ID 290
              );
            } else {
              throw new ConflictException(
                `Cannot delete building with ID ${id} because it has associated locations.`,
              );
            }
          }
          await deleteFile(building.pic);
          return await manager.delete(Building, { id }).then(() => {
            return { message: `Building with ID ${id} deleted successfully` };
          });
        } else {
          throw new NotFoundException(`Building with ID ${id} not found`);
        }
      });
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Building with id ${id} cannot be deleted because ${error}`,
      );
    }
  }

  async edit(
    id: number,
    updateBuildingDto: UpdateBuildingDto,
    confirm: boolean,
    file: Express.Multer.File | undefined,
  ) {
    if (!(await this.buildingRepository.exists({ where: { id } }))) {
      throw new NotFoundException(`Building with ID ${id} not found`);
    }
    if (
      updateBuildingDto.entityId &&
      !(await this.entityService.exist(updateBuildingDto.entityId))
    ) {
      throw new NotFoundException(
        `Entity with ID ${updateBuildingDto.entityId} not found`,
      );
    }

    // start transaction
    try {
      return await this.dataSource.transaction(async (manager) => {
        const building = await manager.findOne(Building, {
          where: { id },
          relations: ['entity', 'locations'],
          lock: { mode: 'pessimistic_write' },
        });
        if (building) {
          if (
            updateBuildingDto.entityId &&
            updateBuildingDto.entityId !== building.entity.id &&
            building.locations.length > 0 &&
            !confirm
          ) {
            throw new ConflictException(
              `This action will change building of entity ID ${building.entity.id} to entity with ID ${updateBuildingDto.entityId}. Please confirm to proceed.`,
            );
          }
          if (
            updateBuildingDto.name &&
            (await manager.exists(Building, {
              where: {
                name: updateBuildingDto.name,
                id: Not(id),
                entity: {
                  id: updateBuildingDto.entityId ?? building.entity.id,
                },
              },
            }))
          ) {
            throw new ConflictException(
              `Building with name ${updateBuildingDto.name} already exists in the specified entity`,
            );
          }
          let filename = building.pic;
          if (file) {
            await deleteFile(building.pic ?? 'default.png');
            filename = await saveFile(this.configService, file, 'buildings');
          }
          const { entityId, ...rest } = updateBuildingDto;
          return manager.save(Building, {
            id: id,
            ...(file && { pic: filename }),
            ...(entityId && { entity: { id: entityId } }),
            ...rest,
          });
        } else {
          throw new NotFoundException(`Building with ID ${id} not found`);
        }
      });
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Failed to update building with ID ${id} with ${error}`,
      );
    }
  }
}
