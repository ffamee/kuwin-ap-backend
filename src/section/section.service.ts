import { BadRequestException, Injectable } from '@nestjs/common';
import { Section } from './entities/section.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateSectionDto } from './dto/create-section.dto';
import { Entity } from '../entities/entities/entity.entity';

@Injectable()
export class SectionService {
  constructor(
    @InjectRepository(Section)
    private readonly sectionRepository: Repository<Section>,
  ) {}

  findAll(): Promise<Section[]> {
    return this.sectionRepository.find({ relations: ['entities'] });
  }

  async findOne(secId: number): Promise<Entity[]> {
    const res = await this.sectionRepository.findOne({
      where: { id: secId },
      relations: ['entities'],
    });
    if (!res) {
      throw new BadRequestException('Section not found');
    }
    const { entities, ...r } = res;
    console.log('get section: ', r);
    return entities;
  }

  create(createSectionDto: CreateSectionDto): Promise<Section> {
    return this.sectionRepository.save(createSectionDto);
  }
}
