import { Controller, Get } from '@nestjs/common';
import { EntitiesService } from './entities.service';

@Controller('entities')
export class EntitiesController {
  constructor(private readonly entitiesService: EntitiesService) {}

  // @Post()
  // create(@Body() createEntityDto: CreateEntityDto) {
  //   return this.entitiesService.create(createEntityDto);
  // }

  @Get()
  findAll() {
    return this.entitiesService.findAll();
  }
}
