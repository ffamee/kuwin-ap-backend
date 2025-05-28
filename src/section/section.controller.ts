import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { SectionService } from './section.service';
import { CreateSectionDto } from './dto/create-section.dto';
import {
  ApiBody,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('Section')
@Controller('section')
export class SectionController {
  constructor(private readonly sectionService: SectionService) {}

  @Get('monitor')
  getMonitorOverview() {
    return this.sectionService.getMonitorOverview();
  }

  @ApiOperation({
    summary: 'Get everything in sections',
  })
  @ApiOkResponse({
    description: "return everything's name",
  })
  @Get('all')
  findAllData() {
    return this.sectionService.findAllData();
  }

  @ApiOperation({
    summary: 'Get all entities in sections with their names',
  })
  @ApiOkResponse({
    description: 'return object with key as section id',
    schema: {
      type: 'object',
      properties: {
        id: {
          properties: {
            id: { type: 'number', example: 1 },
            name: { type: 'string', example: 'Section 1' },
            entities: {
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
                    name: 'Entity 1',
                  },
                  {
                    id: 2,
                    name: 'Entity 2',
                  },
                ],
              },
            },
          },
        },
      },
    },
  })
  @Get('name')
  findAllName() {
    return this.sectionService.findAllName();
  }

  @ApiOperation({
    summary: 'Get overview of a section {section}',
  })
  @ApiParam({
    name: 'section',
    description: 'Section name',
    type: String,
    example: 'faculty',
  })
  @ApiNotFoundResponse({
    description: 'Section not found',
  })
  @ApiOkResponse({
    description: 'return overview of section',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'number', example: 1 },
        name: { type: 'string', example: 'Section 1' },
        apAll: { type: 'number', example: 10 },
        apMaintain: { type: 'number', example: 5 },
        apDown: { type: 'number', example: 2 },
        totalUser: { type: 'number', example: 100 },
        entities: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'number', example: 1 },
              name: { type: 'string', example: 'Entity 1' },
              apAll: { type: 'number', example: 10 },
              apMaintain: { type: 'number', example: 5 },
              apDown: { type: 'number', example: 2 },
              user1: { type: 'number', example: 20 },
              user2: { type: 'number', example: 80 },
            },
          },
        },
      },
    },
  })
  @Get('overview/:section')
  getOverview(@Param('section') sec: string) {
    return this.sectionService.getSectionOverview(sec);
  }

  @ApiOperation({
    summary: 'Get all sections without *others',
  })
  @ApiOkResponse({
    description: 'return list of all sections',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'number' },
          secType: { type: 'string' },
        },
      },
      example: [
        {
          id: 1,
          secType: 'Section 1',
        },
        {
          id: 2,
          secType: 'Section 2',
        },
      ],
    },
  })
  @Get()
  findAll() {
    return this.sectionService.findAll();
  }

  @ApiOperation({
    summary: 'Create a new section by given section name',
  })
  @ApiBody({
    description: 'Section name',
    type: CreateSectionDto,
  })
  @ApiOkResponse({
    description: 'return created section',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'number', example: 1 },
        secType: { type: 'string', example: 'Section 1' },
      },
    },
  })
  @Post()
  create(@Body() createSectionDto: CreateSectionDto) {
    return this.sectionService.create(createSectionDto);
  }
}
