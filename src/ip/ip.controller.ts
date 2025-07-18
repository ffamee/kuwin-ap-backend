import { Controller } from '@nestjs/common';
import { IpService } from './ip.service';

@Controller('ip')
export class IpController {
  constructor(private readonly ipService: IpService) {}
}
