import { Controller } from '@nestjs/common';
import { ConfigurationsService } from './configurations.service';

@Controller('configurations')
export class ConfigurationsController {
  constructor(private readonly configurationsService: ConfigurationsService) {}
}
