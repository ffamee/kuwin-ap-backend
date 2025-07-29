import { Module } from '@nestjs/common';
import { ConfigurationsService } from './configurations.service';
import { ConfigurationsController } from './configurations.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Configuration } from './entities/configuration.entity';
import { IpModule } from '../ip/ip.module';
import { LocationsModule } from '../locations/locations.module';
import { MulterModule } from '@nestjs/platform-express';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { join } from 'path';

@Module({
  imports: [
    TypeOrmModule.forFeature([Configuration]),
    IpModule,
    LocationsModule,
    MulterModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        dest: join(
          process.cwd(),
          configService.get<string>('UPLOAD_DIR', 'uploads'),
          'configurations',
        ),
        limits: {
          fileSize: 10 * 1024 * 1024, // 10 MB
        },
      }),
    }),
  ],
  controllers: [ConfigurationsController],
  providers: [ConfigurationsService],
})
export class ConfigurationsModule {}
