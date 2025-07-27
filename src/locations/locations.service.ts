import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Location } from './entities/location.entity';
import { Repository } from 'typeorm';

@Injectable()
export class LocationsService {
  constructor(
    @InjectRepository(Location)
    private locationsRepository: Repository<Location>,
  ) {}

  private async create(name: string, buildingId: number) {
    try {
      const location = this.locationsRepository.create({
        name,
        building: { id: buildingId },
      });
      const res = await this.locationsRepository.save(location);
      if (res) {
        return res;
      }
      throw new InternalServerErrorException(
        'Failed to create location, please try again later',
      );
    } catch (error: unknown) {
      if (error instanceof Error && 'code' in error) {
        if (error.code === 'ER_DUP_ENTRY')
          throw new ConflictException('Location already exists');
        else if (error.code === 'ER_NO_REFERENCED_ROW_2') {
          throw new NotFoundException('Building does not exist');
        }
        return error;
      }
    }
  }

  async getLocation(name: string, buildingId: number): Promise<number | null> {
    const existingLocation = await this.locationsRepository.findOne({
      where: { name, building: { id: buildingId } },
      select: ['id'],
    });
    if (existingLocation) {
      return existingLocation.id;
    } else {
      const res = await this.create(name, buildingId);
      if (res instanceof Location) {
        return res.id;
      }
      console.error('Failed to create location:', res);
      return null;
    }
  }
}
