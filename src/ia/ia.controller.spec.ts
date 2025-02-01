import { Test, TestingModule } from '@nestjs/testing';
import { IaController } from './ia.controller';

describe('IaController', () => {
  let controller: IaController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [IaController],
    }).compile();

    controller = module.get<IaController>(IaController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
