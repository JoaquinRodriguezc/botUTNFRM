import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { IaService } from '../ia/ia.service';
import makeWASocket from '@whiskeysockets/baileys';

@Injectable()
export class IAWhatsappPluginService {
  // Mapa para rastrear usuarios activos
  private activeUsers: Map<string, boolean> = new Map();
  private socket: ReturnType<typeof makeWASocket>;
  private getText;
  private sendMessage;
  private setUsersNotActive;

  constructor(
    @Inject(forwardRef(() => IaService)) private iaService: IaService,
  ) {}

  public init(socket, getText, sendMessage, setUsersNotActive) {
    this.socket = socket;
    this.getText = getText;
    this.sendMessage = sendMessage;
    this.setUsersNotActive = setUsersNotActive;
  }

  async process(key, message, text: string) {
    try {
      const time = 'Time taken by processChatStream';
      console.time(time);
      const response = await this.iaService.processChatStream(
        text,
        key.participant ?? key.remoteJid,
      );
      console.timeEnd(time);
      const msgTime = 'Time taken by sendMessage';
      console.time(msgTime);
      await this.sendMessage(
        key.remoteJid,
        { text: response },
        { quoted: { key, message } },
      );
      console.timeEnd(msgTime);
    } catch (err) {
      console.log('Error processing messages:', err);
    } finally {
      this.setUsersNotActive(key.participant ?? key.remoteJid);
    }
  }
}
