import { Module } from '@nestjs/common';
import { EntitiesService } from './entities.service';
import { EntitiesController } from './entities.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Entity } from './entities/entity.entity';
import { Section } from '../section/entities/section.entity';
import { Building } from '../buildings/entities/building.entity';
import { SectionModule } from '../section/section.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Entity, Section, Building]),
    SectionModule,
  ],
  controllers: [EntitiesController],
  providers: [EntitiesService],
  exports: [EntitiesService],
})
export class EntitiesModule {}
