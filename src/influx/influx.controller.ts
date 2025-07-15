import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { InfluxService } from './influx.service';

@Controller('influx')
export class InfluxController {
  constructor(private readonly influxService: InfluxService) {}

  @Get('log')
  getApLog(@Query('mac') mac: string, @Query('period') period?: string) {
    return this.influxService.queryApLog(mac, period);
  }

  @Get('last')
  getLastPoint() {
    return this.influxService.queryApLastPoint();
  }

  @Get('ip')
  getApIp() {
    return this.influxService.queryIpLog();
  }

  @Get('test')
  testInflux() {
    return this.influxService.test();
  }

  @Post('write')
  write(@Body() body: { num: string; group: string; name: string }) {
    return this.influxService.write(+body.num, body.group, body.name);
  }
}
