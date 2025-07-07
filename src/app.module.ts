import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ZonesModule } from './zones/zones.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { SectionModule } from './section/section.module';
import { EntitiesModule } from './entities/entities.module';
import { BuildingsModule } from './buildings/buildings.module';
import { AccesspointsModule } from './accesspoints/accesspoints.module';
import { ScheduleModule } from '@nestjs/schedule';
import { TaskModule } from './task/task.module';
import { InfluxModule } from './influx/influx.module';
import { BullModule } from '@nestjs/bullmq';
import { SnmpModule } from './snmp/snmp.module';
import { OidModule } from './oid/oid.module';
import { StatsModule } from './stats/stats.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get<string>('MYSQL_HOST'),
        port: parseInt(configService.get<string>('MYSQL_PORT', '3306'), 10),
        username: configService.get<string>('MYSQL_USER'),
        password: configService.get<string>('MYSQL_PASSWORD'),
        database: configService.get<string>('MYSQL_DATABASE'),
        synchronize: configService.get<string>('SYNCHRONIZE') === 'true',
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        migrations: [__dirname + '/migrations/*{.ts,.js}'],
        charset: 'utf8mb4',
      }),
    }),
    ScheduleModule.forRoot(),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        connection: {
          host: configService.get<string>('REDIS_HOST'),
          port: parseInt(configService.get<string>('REDIS_PORT', '6379'), 10),
        },
        defaultJobOptions: {
          removeOnComplete: 10,
          removeOnFail: 10,
        },
      }),
      extraOptions: {
        manualRegistration: true, // Allows manual registration of queues
      },
    }),
    ZonesModule,
    UsersModule,
    AuthModule,
    SectionModule,
    EntitiesModule,
    BuildingsModule,
    AccesspointsModule,
    TaskModule,
    InfluxModule,
    SnmpModule,
    OidModule,
    StatsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
