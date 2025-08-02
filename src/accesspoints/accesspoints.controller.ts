import { Controller, Get, Param } from '@nestjs/common';
import { AccesspointsService } from './accesspoints.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Accesspoint')
@Controller('accesspoints')
export class AccesspointsController {
  constructor(private readonly accesspointsService: AccesspointsService) {}

  @Get('test/:mac')
  test(@Param('mac') mac: string) {
    return this.accesspointsService.test(mac);
  }
}
