import { Controller, Get, Param } from '@nestjs/common';
import { BuildingsService } from './buildings.service';

@Controller('buildings')
export class BuildingsController {
  constructor(private readonly buildingsService: BuildingsService) {}

  @Get(':entityId')
  findOne(@Param('entityId') entityId: string) {
    return this.buildingsService.findOne(+entityId);
  }

  @Get()
  findAll() {
    return this.buildingsService.findAll();
  }
}
