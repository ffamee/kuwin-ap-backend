import { Module, forwardRef } from '@nestjs/common';
import { BuildingsService } from './buildings.service';
import { BuildingsController } from './buildings.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Building } from './entities/building.entity';
import { Entity } from '../entities/entities/entity.entity';
import { EntitiesModule } from '../entities/entities.module';
import { Accesspoint } from '../accesspoints/entities/accesspoint.entity';
import { AccesspointsModule } from '../accesspoints/accesspoints.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Building, Entity, Accesspoint]),
    forwardRef(() => EntitiesModule),
    forwardRef(() => AccesspointsModule),
  ],
  controllers: [BuildingsController],
  providers: [BuildingsService],
  exports: [BuildingsService],
})
export class BuildingsModule {}
