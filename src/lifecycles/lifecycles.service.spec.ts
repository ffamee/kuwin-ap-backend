import { Test, TestingModule } from '@nestjs/testing';
import { LifecyclesService } from './lifecycles.service';

describe('LifecyclesService', () => {
  let service: LifecyclesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LifecyclesService],
    }).compile();

    service = module.get<LifecyclesService>(LifecyclesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
