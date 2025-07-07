import { Test, TestingModule } from '@nestjs/testing';
import { SnmpController } from './snmp.controller';

describe('SnmpController', () => {
  let controller: SnmpController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SnmpController],
    }).compile();

    controller = module.get<SnmpController>(SnmpController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
