import { Controller, Post, Body } from '@nestjs/common';
import { IaService } from './ia.service';

@Controller('chat')
export class IaController {
  constructor(private readonly iaService: IaService) {}

  @Post()
  async chat(@Body() body: { prompt: string }) {
    return await this.iaService.processChatStream(body.prompt);
  }
}
