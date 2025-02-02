import { Controller, Post, Get, Res, Body } from '@nestjs/common';
import { Response } from 'express';
import { IaService } from './ia.service';

@Controller('chat')
export class IaController {
  constructor(private readonly iaService: IaService) {}


  @Post('chat')
  async chat(@Res() res: Response, @Body('prompt') prompt: string) {
    return this.iaService.processChatStream(res, prompt);
  }
}
