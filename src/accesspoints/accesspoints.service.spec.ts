import { Test, TestingModule } from '@nestjs/testing';
import { AccesspointsService } from './accesspoints.service';

describe('AccesspointsService', () => {
  let service: AccesspointsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AccesspointsService],
    }).compile();

    service = module.get<AccesspointsService>(AccesspointsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
