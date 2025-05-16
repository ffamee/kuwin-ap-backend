import { Module } from '@nestjs/common';
import { AccesspointsService } from './accesspoints.service';
import { AccesspointsController } from './accesspoints.controller';
import { Building } from 'src/buildings/entities/building.entity';
import { Accesspoint } from './entities/accesspoint.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BuildingsModule } from '../buildings/buildings.module';

@Module({
  imports: [TypeOrmModule.forFeature([Accesspoint, Building]), BuildingsModule],
  controllers: [AccesspointsController],
  providers: [AccesspointsService],
})
export class AccesspointsModule {}
