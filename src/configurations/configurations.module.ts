import { Module } from '@nestjs/common';
import { ConfigurationsService } from './configurations.service';
import { ConfigurationsController } from './configurations.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Configuration } from './entities/configuration.entity';
import { IpModule } from '../ip/ip.module';
import { LocationsModule } from '../locations/locations.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Configuration]),
    IpModule,
    LocationsModule,
  ],
  controllers: [ConfigurationsController],
  providers: [ConfigurationsService],
})
export class ConfigurationsModule {}
