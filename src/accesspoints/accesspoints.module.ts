import { Module, forwardRef } from '@nestjs/common';
import { AccesspointsService } from './accesspoints.service';
import { AccesspointsController } from './accesspoints.controller';
import { Building } from '../buildings/entities/building.entity';
import { Accesspoint } from './entities/accesspoint.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BuildingsModule } from '../buildings/buildings.module';
import { SectionModule } from '../section/section.module';
import { InfluxModule } from '../influx/influx.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Accesspoint, Building]),
    forwardRef(() => BuildingsModule),
    forwardRef(() => SectionModule),
    forwardRef(() => InfluxModule),
  ],
  controllers: [AccesspointsController],
  providers: [AccesspointsService],
  exports: [AccesspointsService],
})
export class AccesspointsModule {}
