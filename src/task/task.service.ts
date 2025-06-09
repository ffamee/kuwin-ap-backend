import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import * as snmp from 'net-snmp';

@Injectable()
export class TaskService {
  constructor() {}

  @Cron(CronExpression.EVERY_5_SECONDS)
  handleCron() {
    console.log('Called Every 5 Seconds', new Date().toISOString());
  }
}
