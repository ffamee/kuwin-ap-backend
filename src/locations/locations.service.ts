import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Location } from './entities/location.entity';
import {
  EntityManager,
  IsNull,
  MoreThanOrEqual,
  Not,
  Repository,
} from 'typeorm';

@Injectable()
export class LocationsService {
  constructor(
    @InjectRepository(Location)
    private locationsRepository: Repository<Location>,
  ) {}

  private async create(
    manager: EntityManager,
    name: string,
    buildingId: number,
  ) {
    try {
      const location = manager.create(Location, {
        name,
        building: { id: buildingId },
      });
      const res = await manager.save(location);
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
        throw new InternalServerErrorException(
          'An unexpected error occurred while creating the location',
        );
      }
    }
  }

  private async restoreLocation(id: number) {
    const loc = await this.locationsRepository.findOne({
      where: { id },
      withDeleted: true,
    });
    if (!loc) {
      throw new NotFoundException('Location not found');
    }
    if (!loc.deletedAt) {
      throw new ConflictException('Location is not soft-deleted');
    }
    return this.locationsRepository
      .restore(id)
      .then(() => ({
        message: 'Location restored successfully',
      }))
      .catch((error) => {
        console.error('Error restoring location:', error);
        throw new InternalServerErrorException(
          'Failed to restore location, please try again later',
        );
      });
  }

  async getLocation(
    manager: EntityManager,
    name: string,
    buildingId: number,
  ): Promise<number | null> {
    const existingLocation = await manager.findOne(Location, {
      where: { name, building: { id: buildingId } },
      withDeleted: true,
      select: ['id', 'deletedAt'],
    });
    if (existingLocation) {
      if (existingLocation.deletedAt) {
        await this.restoreLocation(existingLocation.id);
      }
      return existingLocation.id;
    } else {
      const res = await this.create(manager, name, buildingId);
      if (res instanceof Location) {
        return res.id;
      }
      console.error('Failed to create location:', res);
      return null;
    }
  }

  async softDeleteLocation(manager: EntityManager, id: number) {
    if (!(await this.locationsRepository.exists({ where: { id } }))) {
      throw new NotFoundException('Location not found');
    }
    return await manager
      .softDelete(Location, id)
      .then(() => ({
        message: 'Location soft-deleted successfully',
      }))
      .catch((error) => {
        console.error('Error soft-deleting location:', error);
        throw new InternalServerErrorException(
          'Failed to soft-delete location, please try again later',
        );
      });
  }

  async hardDeleteLocation(id: number) {
    const loc = await this.locationsRepository.findOne({
      where: { id },
      withDeleted: true,
      select: ['id', 'deletedAt'],
    });
    if (!loc) {
      throw new NotFoundException('Location not found');
    }
    if (!loc.deletedAt) {
      throw new ConflictException('Location is not soft-deleted');
    }
    return await this.locationsRepository
      .delete(id)
      .then(() => ({ message: 'Location deleted successfully' }))
      .catch((error) => {
        console.error('Error deleting location:', error);
        throw new InternalServerErrorException(
          'Failed to delete location, please try again later',
        );
      });
  }

  async testfindWithDeleted() {
    return this.locationsRepository.find({
      withDeleted: false,
      relations: ['building'],
      where: { id: MoreThanOrEqual(2763) },
    });
  }
  async testfindDeleted() {
    return this.locationsRepository.find({
      withDeleted: true,
      relations: ['building'],
      select: {
        id: true,
        name: true,
        deletedAt: true,
        building: {
          id: true,
          name: true,
        },
      },
      where: { deletedAt: Not(IsNull()) },
      order: { deletedAt: 'DESC' },
    });
  }
}
