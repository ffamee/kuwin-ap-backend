import { Controller, Get, Query } from '@nestjs/common';
import { BuildingsService } from './buildings.service';
import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { Building } from './entities/building.entity';

@ApiTags('Building')
@Controller('buildings')
export class BuildingsController {
  constructor(private readonly buildingsService: BuildingsService) {}

  @ApiOperation({ summary: 'Get building overview by buildingID' })
  @ApiQuery({
    name: 'sec',
    required: true,
    description:
      'Section ID (1 for faculty, 2 for organization, 3 for dormitory)',
    type: Number,
  })
  @ApiQuery({
    name: 'entity',
    required: true,
    description: 'Entity ID',
    type: Number,
  })
  @ApiQuery({
    name: 'build',
    required: true,
    description: 'Building ID',
    type: Number,
  })
  @ApiNotFoundResponse({
    description: 'Building with the given ID not found',
  })
  @ApiOkResponse({
    description: 'Building overview',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'number', example: 1 },
        name: { type: 'string', example: 'Main Building' },
        apAll: { type: 'number', example: 10 },
        apMaintain: { type: 'number', example: 2 },
        apDown: { type: 'number', example: 8 },
        totalUser: { type: 'number', example: 100 },
        accesspoints: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'number', example: 1 },
              name: { type: 'string', example: 'Access Point 1' },
              status: { type: 'string', example: 'active' },
            },
          },
        },
      },
    },
  })
  @Get('overview')
  getBuildingOverview(
    @Query('sec') sectionId: string,
    @Query('entity') entityId: string,
    @Query('build') buildingId: string,
  ) {
    return this.buildingsService.getBuildingOverview(
      +sectionId,
      +entityId,
      +buildingId,
    );
  }

  @Get()
  @ApiOperation({ summary: 'Get all buildings' })
  @ApiOkResponse({
    description: 'All buildings',
    type: [Building],
  })
  findAll() {
    return this.buildingsService.findAll();
  }
}
