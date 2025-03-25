import { Test, TestingModule } from '@nestjs/testing';
import { IaService } from './ia.service';
import { Tools } from './tools';

describe('IaService', () => {
  let service: IaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [IaService, Tools],
    }).compile();

    service = module.get<IaService>(IaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
