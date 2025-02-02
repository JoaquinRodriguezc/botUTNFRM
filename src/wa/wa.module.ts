import { Module } from '@nestjs/common';
import { TagEveryone } from './wa.plugin.service';
import { WaService } from './wa.service';
import { WaController } from './wa.controller';

@Module({
  providers: [TagEveryone, WaService],
  controllers: [WaController],
})
export class WaModule {}
