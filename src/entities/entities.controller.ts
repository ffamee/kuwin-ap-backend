import { Controller, Get, Param } from '@nestjs/common';
import { EntitiesService } from './entities.service';

@Controller('entities')
export class EntitiesController {
  constructor(private readonly entitiesService: EntitiesService) {}

  // @Post()
  // create(@Body() createEntityDto: CreateEntityDto) {
  //   return this.entitiesService.create(createEntityDto);
  // }

  @Get(':section')
  findOne(@Param('section') section: string) {
    return this.entitiesService.findOne(section);
  }

  @Get()
  findAll() {
    return this.entitiesService.findAll();
  }
}
