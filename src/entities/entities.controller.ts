import { Controller, Get, Param } from '@nestjs/common';
import { EntitiesService } from './entities.service';
import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { Entity } from './entities/entity.entity';

@ApiTags('Entity')
@Controller('entities')
export class EntitiesController {
  constructor(private readonly entitiesService: EntitiesService) {}

  // @Post()
  // create(@Body() createEntityDto: CreateEntityDto) {
  //   return this.entitiesService.create(createEntityDto);
  // }
  @ApiOperation({
    summary: 'Get all buildings in entities with their names',
  })
  @ApiOkResponse({
    description: 'return object with key as entity id',
    schema: {
      type: 'object',
      properties: {
        id: {
          properties: {
            id: { type: 'number', example: 1 },
            name: { type: 'string', example: 'Section 1' },
            buildings: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'number', example: 1 },
                  name: { type: 'string', example: 'Building 1' },
                },
              },
            },
          },
        },
      },
    },
  })
  @Get('name')
  findAllName() {
    return this.entitiesService.findAllName();
  }

  @ApiOperation({
    summary: 'Get entity overview by entity ID',
  })
  @ApiParam({
    name: 'entityId',
    description: 'ID of the entity to get overview for',
    required: true,
    type: Number,
    example: 1,
  })
  @ApiNotFoundResponse({
    description: 'Entity with the given ID not found',
  })
  @ApiOkResponse({
    description: 'Overview of the entity',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'number', example: 1 },
        name: { type: 'string', example: 'Entity Name' },
        apAll: { type: 'number', example: 10 },
        apMaintain: { type: 'number', example: 5 },
        apDown: { type: 'number', example: 2 },
        totalUser: { type: 'number', example: 100 },
        buildings: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'number', example: 1 },
              name: { type: 'string', example: 'Building Name' },
              apAll: { type: 'number', example: 10 },
              apMaintain: { type: 'number', example: 5 },
              apDown: { type: 'number', example: 2 },
              user1: { type: 'number', example: 50 },
              user2: { type: 'number', example: 50 },
            },
          },
        },
        accesspoints: {
          type: 'object',
          properties: {
            id: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'number', example: 1 },
                  status: { type: 'string', example: 'active' },
                  ip: { type: 'string', example: '1.1.1.1' },
                  name: { type: 'string', example: 'Accesspoint Name' },
                  location: { type: 'string', example: 'Location Name' },
                  numberClient: { type: 'number', example: 50 },
                  numberClient_2: { type: 'number', example: 50 },
                },
              },
            },
          },
        },
      },
    },
  })
  @Get('overview/:entityId')
  getEntityOverview(@Param('entityId') entityId: string) {
    return this.entitiesService.getEntityOverview(+entityId);
  }

  @ApiOperation({
    summary: 'Get all entities in section #{section}',
  })
  @ApiParam({
    name: 'section',
    description: 'Section type',
    required: true,
    type: String,
    example: 'faculty',
  })
  @ApiNotFoundResponse({
    description: 'Given section not found',
  })
  @ApiOkResponse({
    description: 'All entities in the section',
    type: [Entity],
    example: [
      {
        id: 1,
        name: 'Entity 1',
      },
      {
        id: 2,
        name: 'Entity 2',
      },
    ],
  })
  @Get(':section')
  findOne(@Param('section') section: string) {
    return this.entitiesService.findOne(section);
  }

  @ApiOperation({
    summary: 'Get all entities for each section',
  })
  @ApiOkResponse({
    description: 'return object with key as section name of all entities',
    schema: {
      type: 'object',
      properties: {
        faculty: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'number' },
              name: { type: 'string' },
            },
            example: [
              {
                id: 1,
                name: 'Faculty 1',
              },
              {
                id: 2,
                name: 'Faculty 2',
              },
            ],
          },
        },
        organization: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'number' },
              name: { type: 'string' },
            },
            example: [
              {
                id: 1,
                name: 'Organization 1',
              },
              {
                id: 2,
                name: 'Organization 2',
              },
            ],
          },
        },
        dormitory: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'number' },
              name: { type: 'string' },
            },
            example: [
              {
                id: 1,
                name: 'Dormitory 1',
              },
              {
                id: 2,
                name: 'Dormitory 2',
              },
            ],
          },
        },
      },
    },
  })
  @Get()
  findAll() {
    return this.entitiesService.findAll();
  }
}
