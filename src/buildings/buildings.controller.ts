import { Controller, Get, Param } from '@nestjs/common';
import { BuildingsService } from './buildings.service';
import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { Building } from './entities/building.entity';

@ApiTags('Building')
@Controller('buildings')
export class BuildingsController {
  constructor(private readonly buildingsService: BuildingsService) {}

  @ApiOperation({ summary: 'Get building overview by buildingID' })
  @ApiParam({
    name: 'buildingId',
    description: 'Building ID',
    required: true,
    type: String,
    example: '1',
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
  @Get('overview/:buildingId')
  getBuildingOverview(@Param('buildingId') buildingId: string) {
    return this.buildingsService.getBuildingOverview(+buildingId);
  }

  @Get(':entityId')
  @ApiOperation({ summary: 'Get all buildings in entity #{ID}' })
  @ApiParam({
    name: 'entityId',
    description: 'Entity ID',
    required: true,
    type: String,
    example: '4',
  })
  @ApiOkResponse({
    description: 'All buildings in the entity #{ID}',
    type: [Building],
    example: [
      {
        id: 22,
        idF: 4,
        idZ: 1,
        name: 'กองกิจการนิสิต',
        pic: 'student.jpg',
        comment: '',
        latitude: '13.84725',
        longtitude: '100.56861',
        codeId: 1,
      },
      {
        id: 131,
        idF: 4,
        idZ: 1,
        name: 'อาคารชมรมกิจกรรมนิสิต(ตึก8)',
        pic: 'pictureBuilding131',
        comment: '',
        latitude: null,
        longtitude: null,
        codeId: 2,
      },
    ],
  })
  @ApiNotFoundResponse({
    description: 'entity #{ID} not found',
  })
  findOne(@Param('entityId') entityId: string) {
    return this.buildingsService.findOne(+entityId);
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
