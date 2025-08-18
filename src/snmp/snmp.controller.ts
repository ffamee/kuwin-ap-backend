import { Controller, Get, Ip, Param, Req } from '@nestjs/common';
import { Request } from 'express';
import { SnmpService } from './snmp.service';

@Controller('snmp')
export class SnmpController {
  constructor(private readonly snmpService: SnmpService) {}

  @Get('connected')
  findConnected(@Ip() ip: string, @Req() req: Request) {
    console.log({
      ip,
      socket: req.socket.remoteAddress,
      message: `Your IP is ${req.ip} ${req.get('X-Forwarded-For') ? `and forwarded IP is ${req.get('X-Forwarded-For')}` : ''}`,
    });
    return this.snmpService.findAPClient(req.get('X-Forwarded-For'));
  }

  @Get(':oid')
  test(@Param('oid') oid: string) {
    return this.snmpService.testSnmp(oid);
  }
}
