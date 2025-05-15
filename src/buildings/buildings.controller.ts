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
  })
  findAll() {
    return this.buildingsService.findAll();
  }
}
