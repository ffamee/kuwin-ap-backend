import { Module } from '@nestjs/common';
import { EntitiesService } from './entities.service';
import { EntitiesController } from './entities.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Entity } from './entities/entity.entity';
import { Section } from '../section/entities/section.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Entity, Section])],
  controllers: [EntitiesController],
  providers: [EntitiesService],
})
export class EntitiesModule {}
