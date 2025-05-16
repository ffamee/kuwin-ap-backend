import { Test, TestingModule } from '@nestjs/testing';
import { AccesspointsController } from './accesspoints.controller';
import { AccesspointsService } from './accesspoints.service';

describe('AccesspointsController', () => {
  let controller: AccesspointsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AccesspointsController],
      providers: [AccesspointsService],
    }).compile();

    controller = module.get<AccesspointsController>(AccesspointsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
