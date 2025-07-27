import { Body, Controller, Post } from '@nestjs/common';
import { ConfigurationsService } from './configurations.service';
import { CreateConfigurationDto } from './dto/create-configuration.dto';

@Controller('configurations')
export class ConfigurationsController {
  constructor(private readonly configurationsService: ConfigurationsService) {}

  @Post('create')
  create(@Body() createConfigurationDto: CreateConfigurationDto) {
    return this.configurationsService.create(createConfigurationDto);
  }
}
