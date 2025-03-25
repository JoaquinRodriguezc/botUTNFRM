import { Module } from '@nestjs/common';
import { IaService } from './ia.service';
import { IaController } from './ia.controller';
import { SourceModule } from 'src/source/source.module';
import { SystemPromptService } from './systemprompt';
import { Tools } from './tools';

@Module({
  providers: [Tools, IaService, SystemPromptService],
  controllers: [IaController],
  exports: [IaService],
  imports: [SourceModule],
})
export class IaModule {}
