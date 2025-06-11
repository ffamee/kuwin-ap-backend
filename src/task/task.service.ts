import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import * as snmp from 'net-snmp';
import { exec } from 'child_process';
import * as path from 'path';

@Injectable()
export class TaskService {
  @Cron(CronExpression.EVERY_5_MINUTES)
  handleCron() {
    console.log('Called Every 5 Minutes', new Date().toISOString());
  }

  // This method is called every minute using the cron expression '* * * * *'
  @Cron('* * * * *')
  handleOwnExpression() {
    console.log('Called Every Minute', snmp.Version['2c']);
  }

  @Cron(CronExpression.EVERY_5_SECONDS)
  test() {
    // console log every key in snmp version type
    console.log('Called Every 5 Seconds');
    const execPath = path.resolve(__dirname, '../../a.exe');
    exec(`"${execPath}" fame 1234`, (error, stdout, stderr) => {
      if (error) {
        console.error(`exec error: ${error.message}`);
        return;
      }
      if (stdout) {
        console.log(`stdout: ${stdout}`);
      }
      if (stderr) {
        console.error(`stderr: ${stderr}`);
      }
    });
  }
}
