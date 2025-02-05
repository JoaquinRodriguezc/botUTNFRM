import { Injectable } from '@nestjs/common';
import { IaService } from '../ia/ia.service';
import { Response } from 'express';

@Injectable()
export class WaIaService {
  private socket;
  private getText;
  private sendMessage;
  private trigger;

  constructor(private readonly iaService: IaService) {
    this.trigger = 'all';
  }

  public init(socket, getText, sendMessage) {
    this.socket = socket;
    this.getText = getText;
    this.sendMessage = sendMessage;
  }

  async process(key, message) {
    const prompt = this.getText(key, message);

    try {
      // Enviar mensaje de "pensando"
      await this.sendMessage(
        key.remoteJid,
        { text: 'Pensando...' },
        { quoted: { key, message } },
      );

      let fullResponse = '';
      const mockResponse = {
        write: (data: string) => {
          const text = data.replace('data: ', '');
          fullResponse += text;
        },
        setHeader: () => {},
        end: () => {},
        status: () => mockResponse,
        sendStatus: () => mockResponse,
        links: () => mockResponse,
        send: () => mockResponse,
        json: () => mockResponse,
        headersSent: false,
        locals: {},
        charset: '',
        app: null,
      } as unknown as Response;

      await this.iaService.processChatStream(prompt);

      await this.sendMessage(
        key.remoteJid,
        { text: fullResponse.trim() },
        { quoted: { key, message } },
      );
    } catch (error) {
      console.error(
        '\x1b[31m%s\x1b[0m',
        'Error en el procesamiento de IA:',
        error,
      );
    }
  }
}
