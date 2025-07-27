import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Configuration } from './entities/configuration.entity';
import { Repository } from 'typeorm';
import { IpService } from '../ip/ip.service';
import { CreateConfigurationDto } from './dto/create-configuration.dto';
import { LocationsService } from '../locations/locations.service';

@Injectable()
export class ConfigurationsService {
  constructor(
    @InjectRepository(Configuration)
    private configurationsRepository: Repository<Configuration>,
    private readonly ipService: IpService,
    private readonly locationsService: LocationsService,
  ) {}

  async create(configuration: CreateConfigurationDto) {
    const ip = await this.ipService.getIp(configuration.ip);
    if (!ip) {
      throw new ConflictException(
        'IP address not found or could not be created',
      );
    }
    const location = await this.locationsService.getLocation(
      configuration.name,
      configuration.buildingId,
    );
    if (!location) {
      throw new ConflictException('Location not found or could not be created');
    }
    return { ip, location };
  }
}
