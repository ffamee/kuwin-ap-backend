import { Injectable } from '@nestjs/common';
import { Section } from './entities/section.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateSectionDto } from './dto/create-section.dto';

@Injectable()
export class SectionService {
  constructor(
    @InjectRepository(Section)
    private readonly sectionRepository: Repository<Section>,
  ) {}

  findAll(): Promise<Section[]> {
    return this.sectionRepository.find({ relations: ['entities'] });
  }

  create(createSectionDto: CreateSectionDto): Promise<Section> {
    return this.sectionRepository.save(createSectionDto);
  }
}
