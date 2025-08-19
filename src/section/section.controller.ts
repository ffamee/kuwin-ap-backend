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
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { UpdateSectionDto } from './dto/update-section.dto';

@ApiTags('Section')
@Controller('section')
export class SectionController {
  constructor(private readonly sectionService: SectionService) {}

  @ApiOperation({
    summary: 'Get monitor data for sections (Top page)',
  })
  @Get('monitor')
  getMonitor() {
    return this.sectionService.getMonitor();
  }

  @ApiOperation({
    summary:
      'Get all entities in sections with their names (ununsed frontend /report)',
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
        entities: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'number' },
              name: { type: 'string' },
              count: {
                type: 'number',
                description:
                  'Count of metrics in entity e.g. configCount, downCount clientCount',
              },
            },
          },
          example: [
            { id: 1, name: 'Entity 1', count: 5 },
            { id: 2, name: 'Entity 2', count: 3 },
          ],
        },
        count: {
          type: 'number',
          example: 2,
          description:
            'Count of metrics in section e.g. configCount, downCount clientCount',
        },
      },
    },
  })
  @Get('overview')
  getOverview(@Query('sec') sectionId: string) {
    return this.sectionService.getSectionOverview(+sectionId);
  }

  @ApiOperation({
    summary: 'Create a new section by given section name',
  })
  @ApiBody({
    description: 'Section name',
    required: true,
    examples: {
      'New Section': {
        summary: 'Create Section',
        value: {
          name: 'new section',
        },
      },
    },
    type: CreateSectionDto,
  })
  @ApiConflictResponse({
    description: 'Section with name already exists',
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
  @Post('create')
  create(@Body() createSectionDto: CreateSectionDto) {
    return this.sectionService.create(createSectionDto);
  }

  @ApiOperation({
    summary: 'Delete a section by id',
  })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'Section id',
    schema: {
      type: 'string',
      example: '1',
    },
  })
  @ApiQuery({
    name: 'confirm',
    required: false,
    description: 'Confirm deletion of section',
    schema: {
      type: 'string',
    },
  })
  @ApiOkResponse({
    description: 'Section deleted successfully',
  })
  @ApiNotFoundResponse({
    description: 'Section not found',
  })
  @ApiConflictResponse({
    description:
      'Section cannot be deleted because it has associated entities, please confirm deletion',
  })
  @Delete(':id')
  remove(@Param('id') id: string, @Query('confirm') confirm: string) {
    return this.sectionService.remove(+id, confirm === 'true');
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
        name: { type: 'string', example: 'Updated Section' },
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
