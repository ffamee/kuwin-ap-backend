import { forwardRef, Module } from '@nestjs/common';
import { SectionService } from './section.service';
import { SectionController } from './section.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Section } from './entities/section.entity';
import { AccesspointsModule } from '../accesspoints/accesspoints.module';
import { EntitiesModule } from '../entities/entities.module';
import { InfluxModule } from 'src/influx/influx.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Section]),
    forwardRef(() => AccesspointsModule),
    forwardRef(() => EntitiesModule),
    InfluxModule,
  ],
  controllers: [SectionController],
  providers: [SectionService],
  exports: [SectionService],
})
export class SectionModule {}
