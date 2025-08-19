import { Controller, Delete, Param } from '@nestjs/common';
import { LocationsService } from './locations.service';

@Controller('locations')
export class LocationsController {
  constructor(private readonly locationsService: LocationsService) {}

  @Delete(':id')
  hardDeleteLocation(@Param('id') id: number) {
    return this.locationsService.hardDeleteLocation(id);
  }
}
