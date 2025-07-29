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
import { AccesspointsService } from '../accesspoints/accesspoints.service';
import { CreateBuildingDto } from './dto/create-building.dto';
import { UpdateBuildingDto } from './dto/update-building.dto';
import { ConfigService } from '@nestjs/config';
import { deleteFile, saveFile } from 'src/shared/utils/file-system';
import { Accesspoint } from 'src/accesspoints/entities/accesspoint.entity';
import { Entity } from 'src/entities/entities/entity.entity';
import { InfluxService } from 'src/influx/influx.service';

@Injectable()
export class BuildingsService {
  constructor(
    private dataSource: DataSource,
    private readonly configService: ConfigService,
    private readonly influxService: InfluxService,
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

  // async getBuildingOverview(
  //   sectionId: number,
  //   entityId: number,
  //   buildingId: number,
  // ) {
  //   const building = await this.buildingRepository.findOne({
  //     where: {
  //       id: buildingId,
  //       entity: { id: entityId, section: { id: sectionId } },
  //     },
  //     relations: ['accesspoints', 'entity'],
  //     select: {
  //       entity: { name: true, id: true },
  //       accesspoints: {
  //         id: true,
  //         name: true,
  //         status: true,
  //         ip: true,
  //         location: true,
  //         problem: true,
  //         numberClient: true,
  //         numberClient_2: true,
  //         wlcActive: true,
  //         wlc: true,
  //       },
  //     },
  //   });
  //   if (!building) {
  //     throw new NotFoundException(`Building with id ${buildingId} not found`);
  //   }
  // const [apAll, apMaintain, apDown, totalUser, dynamic] = await Promise.all([
  // this.accesspointsService.countAPInBuilding(buildingId),
  // this.accesspointsService.countAPMaintainInBuilding(buildingId),
  // this.accesspointsService.countAPDownInBuilding(buildingId),
  // this.accesspointsService.sumAllClientInBuilding(buildingId),
  // this.influxService.findOneBuilding(sectionId, entityId, buildingId),
  // ]);
  //   return {
  //     id: building.id,
  //     name: building.name,
  //     apAll,
  //     apMaintain,
  //     apDown,
  //     totalUser,
  //     accesspoints: building.accesspoints,
  //     entity: building.entity,
  //     dynamic,
  //   };
  // }

  async find(sectionId: number, entityId: number, buildingId: number) {
    // join location and then join location to configuration and count *
    const [num, building] = await Promise.all([
      this.buildingRepository
        .createQueryBuilder('building')
        .leftJoin('building.entity', 'entity')
        .leftJoin('entity.section', 'section')
        .leftJoin('building.locations', 'location')
        .leftJoin('location.configuration', 'configuration')
        .select('COUNT(configuration.id)', 'configCount')
        .addSelect(
          `SUM(CASE WHEN configuration.lastSeenAt < NOW() - INTERVAL 5 MINUTE OR configuration.status = 'DOWN' THEN 1 ELSE 0 END)`,
          'downCount',
        )
        .addSelect(
          `SUM(CASE WHEN configuration.state = 'MAINTENANCE' THEN 1 ELSE 0 END)`,
          'maCount',
        )
        .addSelect(
          `SUM(CASE WHEN configuration.state NOT IN ('PENDING', 'MAINTENANCE') AND configuration.status != 'DOWN' THEN configuration.client_24 ELSE 0 END)`,
          'c24Count',
        )
        .addSelect(
          `SUM(CASE WHEN configuration.state NOT IN ('PENDING', 'MAINTENANCE') AND configuration.status != 'DOWN' THEN configuration.client_5 ELSE 0 END)`,
          'c5Count',
        )
        .addSelect(
          `SUM(CASE WHEN configuration.state NOT IN ('PENDING', 'MAINTENANCE') AND configuration.status != 'DOWN' THEN configuration.client_6 ELSE 0 END)`,
          'c6Count',
        )
        .where('building.id = :id', { id: buildingId })
        .andWhere('entity.id = :entityId', { entityId })
        .andWhere('section.id = :sectionId', { sectionId })
        .andWhere('configuration.id IS NOT NULL')
        .getRawOne<{
          configCount: number;
          downCount: number;
          maCount: number;
          c24Count: number;
          c5Count: number;
          c6Count: number;
        }>(),
      this.buildingRepository
        .createQueryBuilder('building')
        .leftJoin('building.entity', 'entity')
        .leftJoin('entity.section', 'section')
        .leftJoin('building.locations', 'location')
        .leftJoin('location.configuration', 'configuration')
        .leftJoin('configuration.accesspoint', 'accesspoint')
        .leftJoin('configuration.ip', 'ip')
        .select([
          'building.id',
          'building.name',
          'entity.id',
          'entity.name',
          'location.id',
          'location.name',
          'configuration',
          'accesspoint.id',
          'accesspoint.name',
          'ip.id',
          'ip.ip',
        ])
        .where('building.id = :id', { id: buildingId })
        .andWhere('entity.id = :entityId', { entityId })
        .andWhere('section.id = :sectionId', { sectionId })
        .andWhere('configuration.id IS NOT NULL')
        .getOne(),
    ]);
    if (!building || !num) {
      throw new NotFoundException(`Building with id ${buildingId} not found`);
    }
    return {
      id: building.id,
      name: building.name,
      entity: building.entity,
      configurations: building.locations.flatMap((location) =>
        location.configuration
          ? [
              {
                ...location.configuration,
                location: { id: location.id, name: location.name },
              },
            ]
          : [],
      ),
      ...num,
    };
  }

  async getBuildingById(id: number): Promise<Building> {
    const building = await this.buildingRepository.findOne({
      where: { id },
      relations: ['entity', 'accesspoints'],
    });
    if (!building) {
      throw new NotFoundException(`Building with ID ${id} not found`);
    }
    return building;
  }

  async create(
    createBuildingDto: CreateBuildingDto,
    file: Express.Multer.File | undefined,
  ): Promise<Building> {
    if (!(await this.entityService.exist(createBuildingDto.entityId))) {
      throw new NotFoundException(
        `Entity with ID ${createBuildingDto.entityId} not found`,
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
    return this.buildingRepository.save(building);
  }

  async remove(id: number) {
    const building = await this.buildingRepository.findOne({
      where: { id },
      relations: ['accesspoints'],
    });
    if (!building) {
      throw new NotFoundException(`Building with ID ${id} not found`);
    }
    if (building.accesspoints.length > 0) {
      throw new ConflictException(
        `Cannot delete building with ID ${id} because it has associated access points.`,
      );
    }
    await deleteFile(building.pic ?? 'default.png');
    return this.buildingRepository.delete(id).then(() => {
      return { message: `Building with ID ${id} deleted successfully` };
    });
  }

  async moveAndDelete(id: number) {
    try {
      await this.dataSource.transaction(async (manager) => {
        const building = await manager.findOne(Building, {
          where: { id },
          lock: { mode: 'pessimistic_write' },
        });
        if (building) {
          await deleteFile(building.pic ?? 'default.png');
          await manager.update(
            Accesspoint,
            { building: { id } },
            { building: { id: 290 } },
          );
          await manager.delete(Building, { id });
          return {
            message: `Building with ID ${id} moved and deleted successfully`,
          };
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
    const building = await this.buildingRepository.findOne({
      where: { id },
      relations: ['entity'],
    });
    if (!building) {
      throw new NotFoundException(`Building with ID ${id} not found`);
    }
    if (
      updateBuildingDto.name &&
      (await this.buildingRepository.exists({
        where: { name: updateBuildingDto.name, id: Not(id) },
      }))
    ) {
      throw new ConflictException(
        `Building with name ${updateBuildingDto.name} already exists`,
      );
    }
    if (
      updateBuildingDto.entityId &&
      updateBuildingDto.entityId !== building.entity.id
    ) {
      if (!confirm) {
        throw new ConflictException(
          `Building with ID ${id} cannot be moved to another entity without confirmation`,
        );
      } else {
        try {
          await this.dataSource.transaction(async (manager) => {
            const building = await manager.findOne(Building, {
              where: { id },
              lock: { mode: 'pessimistic_write' },
            });
            if (building) {
              if (
                !(await manager.exists(Entity, {
                  where: { id: updateBuildingDto.entityId },
                }))
              ) {
                throw new NotFoundException(
                  `Entity with ID ${updateBuildingDto.entityId} not found`,
                );
              }
              const { entityId, ...rest } = updateBuildingDto;
              let filename = building.pic;
              if (file) {
                await deleteFile(building.pic ?? 'default.png');
                filename = await saveFile(
                  this.configService,
                  file,
                  'buildings',
                );
              }
              await manager.update(Building, id, {
                ...rest,
                pic: filename,
                entity: { id: entityId },
              });
              return {
                message: `Building with ID ${id} moved to entity ${updateBuildingDto.entityId} successfully`,
              };
            }
          });
        } catch (error) {
          if (error instanceof NotFoundException) {
            throw error;
          }
          throw new InternalServerErrorException(
            `Failed to update building with ID ${id} with ${error}`,
          );
        }
      }
    } else {
      let filename = building.pic;
      if (file) {
        await deleteFile(building.pic ?? 'default.png');
        filename = await saveFile(this.configService, file, 'buildings');
      }
      return this.buildingRepository
        .update(id, {
          ...updateBuildingDto,
          pic: filename,
        })
        .then(() => {
          return { message: `Building with ID ${id} updated successfully.` };
        });
    }
  }
}
