import { Module } from '@nestjs/common';
import { LifecyclesService } from './lifecycles.service';
import { LifecyclesController } from './lifecycles.controller';

@Module({
  controllers: [LifecyclesController],
  providers: [LifecyclesService],
})
export class LifecyclesModule {}
