import { forwardRef, Module } from '@nestjs/common';
import { IaService } from './ia.service';
import { IaController } from './ia.controller';
import { SourceModule } from 'src/source/source.module';
import { SystemPromptService } from './systemprompt';
import { WaModule } from 'src/wa/wa.module';

@Module({
  providers: [IaService, SystemPromptService],
  controllers: [IaController],
  exports: [IaService],
  imports: [forwardRef(() => WaModule), SourceModule],
})
export class IaModule {}
