import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Configuration } from './entities/configuration.entity';
import { Brackets, DataSource, Repository } from 'typeorm';
import { IpService } from '../ip/ip.service';
import { CreateConfigurationDto } from './dto/create-configuration.dto';
import { LocationsService } from '../locations/locations.service';
import { ConfigState, StatusState } from 'src/shared/types/define-state';

@Injectable()
export class ConfigurationsService {
  constructor(
    private dataSource: DataSource,
    @InjectRepository(Configuration)
    private configurationsRepository: Repository<Configuration>,
    private readonly ipService: IpService,
    private readonly locationsService: LocationsService,
  ) {}

  async create(configuration: CreateConfigurationDto) {
    if (
      (await this.configurationsRepository.exists({
        where: { ip: { ip: configuration.ip } },
      })) ||
      (await this.configurationsRepository.exists({
        where: {
          location: {
            name: configuration.name,
            building: { id: configuration.buildingId },
          },
        },
      }))
    ) {
      throw new ConflictException(
        'Configuration with this IP or location already exists',
      );
    }

    try {
      await this.dataSource.transaction(async (manager) => {
        const ip = await this.ipService.getIp(manager, configuration.ip);
        if (!ip) {
          throw new ConflictException(
            'IP address not found or could not be created',
          );
        }
        const location = await this.locationsService.getLocation(
          manager,
          configuration.name,
          configuration.buildingId,
        );
        if (!location) {
          throw new ConflictException(
            'Location not found or could not be created',
          );
        }
        return await manager.insert(Configuration, {
          ip: { id: ip },
          location: { id: location },
        });
      });
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new InternalServerErrorException(
        `An error occurred while creating the configuration,
        ${error}`,
      );
    }
  }

  async getAll() {
    return this.configurationsRepository.find({
      relations: ['ip', 'location', 'accesspoint'],
      select: {
        ip: { id: true, ip: true },
        location: {
          id: true,
          name: true,
        },
        accesspoint: { id: true, name: true },
      },
    });
  }

  async getDown() {
    return this.configurationsRepository
      .createQueryBuilder('configuration')
      .leftJoin('configuration.accesspoint', 'accesspoint')
      .leftJoin('configuration.location', 'location')
      .leftJoin('configuration.ip', 'ip')
      .where(`configuration.state != 'PENDING'`)
      .andWhere(
        new Brackets((qb) => {
          qb.where('configuration.status IN (:down , :download)', {
            down: StatusState.Down,
            download: StatusState.Download,
          })
            .orWhere('configuration.lastSeenAt < NOW() - INTERVAL 5 MINUTE')
            .orWhere('configuration.state = :state', {
              state: ConfigState.Maintenance,
            });
        }),
      )
      .getMany();
  }

  async getDetail(
    sec: number,
    entity: number,
    build: number,
    loc: number,
  ): Promise<Configuration> {
    const configuration = await this.configurationsRepository.findOne({
      where: {
        location: {
          id: loc,
          building: { id: build, entity: { id: entity, section: { id: sec } } },
        },
      },
      relations: ['ip', 'location', 'location.building', 'accesspoint'],
      select: {
        ip: { id: true, ip: true },
        location: {
          id: true,
          name: true,
          building: { id: true, name: true },
        },
        accesspoint: { id: true, name: true },
      },
    });
    if (!configuration) {
      throw new NotFoundException(
        `Configuration in location ID ${loc} not found`,
      );
    }
    return configuration;
  }

  async countAll() {
    return this.configurationsRepository
      .createQueryBuilder('configuration')
      .select(`COUNT(configuration.id)`, 'configCount')
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
      .getRawOne<{
        configCount: number;
        downCount: number;
        maCount: number;
        c24Count: number;
        c5Count: number;
        c6Count: number;
      }>();
  }
}
