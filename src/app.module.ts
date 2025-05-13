import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ZonesModule } from './zones/zones.module';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { dataSourceOptions } from './data-source';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { SectionModule } from './section/section.module';
import { EntitiesModule } from './entities/entities.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
    }),
    TypeOrmModule.forRoot(dataSourceOptions),
    ZonesModule,
    UsersModule,
    AuthModule,
    SectionModule,
    EntitiesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
