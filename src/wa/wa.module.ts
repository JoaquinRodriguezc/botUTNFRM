import { forwardRef, Module } from '@nestjs/common';
import { TagEveryoneService } from './everyone.plugin.service';
import { WaService } from './wa.service';
import { WaController } from './wa.controller';
import { IAWhatsappPluginService } from './ia.plugin.service';
import { IaModule } from '../ia/ia.module';

@Module({
  imports: [forwardRef(() => IaModule)],
  providers: [TagEveryoneService, WaService, IAWhatsappPluginService],
  controllers: [WaController],
  exports: [WaService, IAWhatsappPluginService],
})
export class WaModule {}
