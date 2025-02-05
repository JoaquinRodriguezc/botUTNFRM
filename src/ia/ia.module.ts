import { Module } from '@nestjs/common';
import { IaService } from './ia.service';
import { IaController } from './ia.controller';
import { SourceModule } from 'src/source/source.module';

@Module({
  providers: [IaService],
  controllers: [IaController],
  exports: [IaService],
  imports: [SourceModule],
})
export class IaModule {}
