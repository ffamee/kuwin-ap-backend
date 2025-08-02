import { Module } from '@nestjs/common';
import { AccesspointsService } from './accesspoints.service';
import { AccesspointsController } from './accesspoints.controller';
import { Accesspoint } from './entities/accesspoint.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Accesspoint])],
  controllers: [AccesspointsController],
  providers: [AccesspointsService],
  exports: [AccesspointsService],
})
export class AccesspointsModule {}
