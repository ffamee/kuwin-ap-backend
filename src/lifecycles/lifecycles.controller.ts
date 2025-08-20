import { Controller } from '@nestjs/common';
import { LifecyclesService } from './lifecycles.service';

@Controller('lifecycles')
export class LifecyclesController {
  constructor(private readonly lifecyclesService: LifecyclesService) {}
}
