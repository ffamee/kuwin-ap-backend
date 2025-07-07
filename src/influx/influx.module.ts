import { forwardRef, Module } from '@nestjs/common';
import { InfluxService } from './influx.service';
import { InfluxController } from './influx.controller';
import { AccesspointsModule } from '../accesspoints/accesspoints.module';

@Module({
  imports: [forwardRef(() => AccesspointsModule)],
  providers: [InfluxService],
  exports: [InfluxService],
  controllers: [InfluxController],
})
export class InfluxModule {}
