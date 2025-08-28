import { Module } from '@nestjs/common';
import { LifecyclesService } from './lifecycles.service';
import { LifecyclesController } from './lifecycles.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Lifecycle } from './entities/lifecycle.entity';
import { JwtStrategy } from 'src/auth/strategies/jwt.strategy';

@Module({
  imports: [TypeOrmModule.forFeature([Lifecycle])],
  controllers: [LifecyclesController],
  providers: [LifecyclesService, JwtStrategy],
})
export class LifecyclesModule {}
