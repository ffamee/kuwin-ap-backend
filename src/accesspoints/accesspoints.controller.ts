import { Controller } from '@nestjs/common';
import { AccesspointsService } from './accesspoints.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Accesspoint')
@Controller('accesspoints')
export class AccesspointsController {
  constructor(private readonly accesspointsService: AccesspointsService) {}
}
