import { Controller, Get, Param } from '@nestjs/common';
import { BuildingsService } from './buildings.service';
import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('Building')
@Controller('buildings')
export class BuildingsController {
  constructor(private readonly buildingsService: BuildingsService) {}

  @Get(':entityId')
  @ApiOkResponse({
    description: 'All buildings in the entity #{entityId}',
  })
  @ApiNotFoundResponse({
    description: '#{entityId} not found',
  })
  @ApiParam({
    name: 'entityId',
    description: 'Entity ID',
    required: true,
    type: String,
    example: '1',
  })
  findOne(@Param('entityId') entityId: string) {
    return this.buildingsService.findOne(+entityId);
  }

  @Get()
  @ApiOkResponse({
    description: 'All buildings',
  })
  findAll() {
    return this.buildingsService.findAll();
  }
}
