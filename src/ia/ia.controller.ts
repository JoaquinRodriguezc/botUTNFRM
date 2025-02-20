import { Controller, Post, Body } from '@nestjs/common';
import { IaService } from './ia.service';

@Controller('chat')
export class IaController {
  constructor(private readonly iaService: IaService) {}

  @Post()
  async chat(@Body() body: { prompt: string }) {
    // Para el controlador HTTP, podemos usar un ID genérico o basado en la sesión
    const defaultUserId = 'web-user';
    return await this.iaService.processChatStream(body.prompt, defaultUserId);
  }
}
