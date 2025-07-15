import { forwardRef, Module } from '@nestjs/common';
import { EntitiesService } from './entities.service';
import { EntitiesController } from './entities.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Entity } from './entities/entity.entity';
import { SectionModule } from '../section/section.module';
import { AccesspointsModule } from '../accesspoints/accesspoints.module';
import { BuildingsModule } from 'src/buildings/buildings.module';
import { MulterModule } from '@nestjs/platform-express';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { join } from 'path';
import { InfluxModule } from 'src/influx/influx.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Entity]),
    forwardRef(() => SectionModule),
    forwardRef(() => BuildingsModule),
    forwardRef(() => AccesspointsModule),
    InfluxModule,
    MulterModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        dest: join(
          process.cwd(),
          configService.get<string>('UPLOAD_DIR', 'uploads'),
          'entities',
        ),
        limits: {
          fileSize: 10 * 1024 * 1024, // 10 MB
        },
      }),
    }),
  ],
  controllers: [EntitiesController],
  providers: [EntitiesService],
  exports: [EntitiesService],
})
export class EntitiesModule {}
