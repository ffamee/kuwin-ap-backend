import { forwardRef, Module } from '@nestjs/common';
import { InfluxService } from './influx.service';
import { InfluxController } from './influx.controller';
import { ConfigurationsModule } from 'src/configurations/configurations.module';

@Module({
  imports: [forwardRef(() => ConfigurationsModule)],
  providers: [InfluxService],
  exports: [InfluxService],
  controllers: [InfluxController],
})
export class InfluxModule {}
