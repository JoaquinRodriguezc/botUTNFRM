import { Injectable } from '@nestjs/common';
import { streamText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { Response } from 'express';

@Injectable()
export class IaService {
  async processChatStream(response: Response) {
    try {
      const { textStream } = streamText({
        model: openai('gpt-4o'),
        system: "You are a helpful assistant",
        prompt: "Hola",
      });

      // Configurar headers para streaming
      response.setHeader('Content-Type', 'text/event-stream');
      response.setHeader('Cache-Control', 'no-cache');
      response.setHeader('Connection', 'keep-alive');

      // Stream cada parte de la respuesta
      for await (const textPart of textStream) {
        response.write(`data: ${textPart}\n\n`);
      }

      response.end();

    } catch (error) {
      console.error('Error en procesamiento de IA:', error);
      throw new Error(`Fallo en el servicio de IA: ${error.message}`);
    }
  }
}
