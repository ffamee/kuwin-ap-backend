import { forwardRef, Module } from '@nestjs/common';
import { EntitiesService } from './entities.service';
import { EntitiesController } from './entities.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Entity } from './entities/entity.entity';
import { Section } from '../section/entities/section.entity';
import { Building } from '../buildings/entities/building.entity';
import { SectionModule } from '../section/section.module';
import { AccesspointsModule } from '../accesspoints/accesspoints.module';
import { BuildingsModule } from 'src/buildings/buildings.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Entity, Section, Building]),
    forwardRef(() => SectionModule),
    forwardRef(() => BuildingsModule),
    forwardRef(() => AccesspointsModule),
  ],
  controllers: [EntitiesController],
  providers: [EntitiesService],
  exports: [EntitiesService],
})
export class EntitiesModule {}
