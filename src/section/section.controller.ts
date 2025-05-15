import { Controller, Get, Post, Body } from '@nestjs/common';
import { SectionService } from './section.service';
import { CreateSectionDto } from './dto/create-section.dto';
import { ApiBody, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Section')
@Controller('section')
export class SectionController {
  constructor(private readonly sectionService: SectionService) {}

  @ApiOperation({
    summary: '*unused* Get all sections with entities inside themselves',
  })
  @ApiOkResponse({
    description: 'return list of all sections',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'number', example: 1 },
          secType: { type: 'string', example: 'Section 1' },
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
