import { Module, forwardRef } from '@nestjs/common';
import { BuildingsService } from './buildings.service';
import { BuildingsController } from './buildings.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Building } from './entities/building.entity';
import { EntitiesModule } from '../entities/entities.module';
import { AccesspointsModule } from '../accesspoints/accesspoints.module';
import { MulterModule } from '@nestjs/platform-express';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { join } from 'path';

@Module({
  imports: [
    TypeOrmModule.forFeature([Building]),
    forwardRef(() => EntitiesModule),
    forwardRef(() => AccesspointsModule),
    MulterModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        dest: join(
          process.cwd(),
          configService.get<string>('UPLOAD_DIR', 'uploads'),
          'buildings',
        ),
        limits: {
          fileSize: 10 * 1024 * 1024, // 10 MB
        },
      }),
    }),
  ],
  controllers: [BuildingsController],
  providers: [BuildingsService],
  exports: [BuildingsService],
})
export class BuildingsModule {}
