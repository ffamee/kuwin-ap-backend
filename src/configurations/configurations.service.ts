import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Configuration } from './entities/configuration.entity';
import { DataSource, Repository } from 'typeorm';
import { IpService } from '../ip/ip.service';
import { CreateConfigurationDto } from './dto/create-configuration.dto';
import { LocationsService } from '../locations/locations.service';

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
}
