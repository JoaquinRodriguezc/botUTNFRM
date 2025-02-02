import { Module } from '@nestjs/common';
import { TagEveryone } from './wa.plugin.service';
import { WaService } from './wa.service';
import { WaController } from './wa.controller';
import { WaIaService } from './wa.ia.service';
import { IaModule } from '../ia/ia.module';

@Module({
  imports: [IaModule],
  providers: [TagEveryone, WaService, WaIaService],
  controllers: [WaController],
  exports: [WaIaService]
})
export class WaModule {}
