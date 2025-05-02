import { Injectable } from '@nestjs/common';
import { NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Zone } from './entities/zone.entity';

@Injectable()
export class ZonesService {
  constructor(
    @InjectRepository(Zone) private zoneRepository: Repository<Zone>,
  ) {}

  // create(createZoneDto: CreateZoneDto) {
  //   return 'This action adds a new zone';
  // }

  async findAll(): Promise<Zone[]> {
    console.log(`This action returns all zones`);
    return this.zoneRepository.find();
  }

  async findOne(id: number) {
    console.log(`This action returns a #${id} zone`);
    const zone = await this.zoneRepository.findOneBy({ id: id });
    if (!zone) {
      console.log('Error Not Found');
      throw new NotFoundException(`Zone with id ${id} not found`);
    }
    return zone;
  }

  // update(id: number, updateZoneDto: UpdateZoneDto) {
  //   return `This action updates a #${id} zone`;
  // }

  remove(id: number) {
    return `This action removes a #${id} zone`;
  }
}
