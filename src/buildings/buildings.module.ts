import { Module } from '@nestjs/common';
import { BuildingsService } from './buildings.service';
import { BuildingsController } from './buildings.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Building } from './entities/building.entity';
import { Entity } from '../entities/entities/entity.entity';
import { EntitiesModule } from '../entities/entities.module';

@Module({
  imports: [TypeOrmModule.forFeature([Building, Entity]), EntitiesModule],
  controllers: [BuildingsController],
  providers: [BuildingsService],
})
export class BuildingsModule {}
