import { Test, TestingModule } from '@nestjs/testing';
import { LifecyclesController } from './lifecycles.controller';
import { LifecyclesService } from './lifecycles.service';

describe('LifecyclesController', () => {
  let controller: LifecyclesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LifecyclesController],
      providers: [LifecyclesService],
    }).compile();

    controller = module.get<LifecyclesController>(LifecyclesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
