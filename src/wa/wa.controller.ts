import { Controller, Get } from '@nestjs/common';
import { WaService } from './wa.service';
@Controller('wa')
export class WaController {
  constructor(private waService: WaService) {}

  @Get()
  async get() {
    await this.waService.connect();
    await this.waService.run();
    return 'ok';
  }
}
