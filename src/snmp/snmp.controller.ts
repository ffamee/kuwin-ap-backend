import { InjectQueue } from '@nestjs/bullmq';
import { Controller, Get } from '@nestjs/common';
import { Queue } from 'bullmq';

@Controller('snmp')
export class SnmpController {
  constructor(
    @InjectQueue('wlc-polling-queue') private readonly wlcPollingQueue: Queue,
  ) {}

  @Get()
  getSnmp() {
    return { message: 'SNMP Controller is working!' };
  }

  @Get('add')
  async addSnmp() {
    await this.wlcPollingQueue.add('wlc-polling-job', {
      data: 'This is a test job for SNMP polling',
    });
    return { message: 'SNMP job added to the queue!' };
  }
}
