import { Controller, Get, Query } from '@nestjs/common';
import { InfluxService } from './influx.service';

@Controller('influx')
export class InfluxController {
  constructor(private readonly influxService: InfluxService) {}

  @Get('log')
  getApLog(@Query('mac') mac: string, @Query('period') period?: string) {
    return this.influxService.queryApLog(mac, period);
  }

  @Get('graph')
  getConfigGraph(
    @Query('sec') sec: string,
    @Query('entity') entity: string,
    @Query('build') build: string,
    @Query('loc') loc: string,
    @Query('period') period?: string,
  ) {
    return this.influxService.queryConfigGraph(
      +sec,
      +entity,
      +build,
      +loc,
      period,
    );
  }

  @Get('last')
  getLastPoint() {
    return this.influxService.queryApLastPoint();
  }

  @Get('ip')
  getApIp() {
    return this.influxService.queryIpLog();
  }
}
