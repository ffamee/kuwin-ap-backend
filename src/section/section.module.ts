import { forwardRef, Module } from '@nestjs/common';
import { SectionService } from './section.service';
import { SectionController } from './section.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Section } from './entities/section.entity';
import { InfluxModule } from 'src/influx/influx.module';
import { ConfigurationsModule } from '../configurations/configurations.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Section]),
    forwardRef(() => InfluxModule),
    ConfigurationsModule,
  ],
  controllers: [SectionController],
  providers: [SectionService],
  exports: [SectionService],
})
export class SectionModule {}
