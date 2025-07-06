import { InjectQueue } from '@nestjs/bullmq';
import { Controller, Get, Ip, Req } from '@nestjs/common';
import { Queue } from 'bullmq';
import { Request } from 'express';

@Controller('snmp')
export class SnmpController {
  constructor(
    @InjectQueue('wlc-polling-queue') private readonly wlcPollingQueue: Queue,
  ) {}

  @Get()
  getSnmp() {
    return { message: 'SNMP Controller is working!' };
  }

  @Get('connected')
  findConnected(@Ip() ip: string, @Req() req: Request) {
    return {
      ip,
      socket: req.socket.remoteAddress,
      message: `Your IP is ${req.ip} ${req.get('X-Forwarded-For') ? `and forwarded IP is ${req.get('X-Forwarded-For')}` : ''}`,
    };
  }
}
