import { Module } from '@nestjs/common';
import { TaskService } from './task.service';
import { InfluxModule } from '../influx/influx.module';

@Module({
  imports: [InfluxModule],
  providers: [TaskService],
  exports: [TaskService],
})
export class TaskModule {}
