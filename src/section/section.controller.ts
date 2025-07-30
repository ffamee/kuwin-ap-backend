import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Delete,
  Param,
} from '@nestjs/common';
import { SectionService } from './section.service';
import { CreateSectionDto } from './dto/create-section.dto';
import {
  ApiBody,
  ApiConflictResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { UpdateSectionDto } from './dto/update-section.dto';

@ApiTags('Section')
@Controller('section')
export class SectionController {
  constructor(private readonly sectionService: SectionService) {}

  @Get('monitor')
  getMonitorOverview() {
    return this.sectionService.getMonitorOverview();
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
    summary: 'Get overview of a sectionId {sectionId}',
  })
  @ApiQuery({
    name: 'sec',
    required: true,
    description: 'Section id',
    schema: {
      type: 'string',
      example: '1',
    },
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
  @Get('overview')
  getOverview(@Query('sec') sectionId: string) {
    return this.sectionService.find(+sectionId);
  }

  // @Get(':id')
  // find(@Param('id') id: string) {
  //   return this.sectionService.find(+id);
  // }

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

  @ApiOperation({
    summary: 'Delete a section by id',
  })
  @ApiOkResponse({
    description: 'Section deleted successfully',
  })
  @ApiNotFoundResponse({
    description: 'Section not found',
  })
  @ApiConflictResponse({
    description: 'Section cannot be deleted because it has associated entities',
  })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.sectionService.remove(+id);
  }

  @ApiOperation({
    summary: 'Move entities to deleted section and delete section by id',
  })
  @ApiOkResponse({
    description:
      'Section moved entities to default section and deleted successfully',
  })
  @ApiNotFoundResponse({
    description: 'Section not found',
  })
  @Delete('move/:id')
  moveAndDelete(@Param('id') id: string) {
    return this.sectionService.moveAndDelete(+id);
  }

  @ApiOperation({
    summary: 'Edit a section by id',
  })
  @ApiBody({
    description: 'Section name',
    type: UpdateSectionDto,
    examples: {
      Rename: {
        summary: 'Update Section',
        value: {
          name: 'new section name',
        },
      },
    },
  })
  @ApiOkResponse({
    description: 'return updated section',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'number', example: 1 },
        secType: { type: 'string', example: 'Updated Section' },
      },
    },
  })
  @ApiNotFoundResponse({
    description: 'Section not found',
  })
  @ApiConflictResponse({
    description: 'Section with name already exists',
  })
  @Post('edit/:id')
  edit(@Param('id') id: string, @Body() UpdateSectionDto: UpdateSectionDto) {
    return this.sectionService.edit(+id, UpdateSectionDto);
  }
}
