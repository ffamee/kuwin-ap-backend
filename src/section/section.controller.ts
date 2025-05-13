import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { SectionService } from './section.service';
import { CreateSectionDto } from './dto/create-section.dto';

@Controller('section')
export class SectionController {
  constructor(private readonly sectionService: SectionService) {}

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.sectionService.findOne(+id);
  }

  @Get()
  findAll() {
    return this.sectionService.findAll();
  }

  @Post()
  create(@Body() createSectionDto: CreateSectionDto) {
    return this.sectionService.create(createSectionDto);
  }
}
