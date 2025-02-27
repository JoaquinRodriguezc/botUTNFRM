import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { IaService } from '../ia/ia.service';

@Injectable()
export class IAWhatsappPluginService {
  // Mapa para rastrear usuarios activos
  private activeUsers: Map<string, boolean> = new Map();
  private socket;
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
      const response = await this.iaService.processChatStream(
        text,
        key.participant ?? key.remoteJid,
      );

      this.sendMessage(
        key.remoteJid,
        { text: response },
        { quoted: { key, message } },
      );
    } catch (err) {
      console.log('Error processing messages:', err);
    } finally {
      this.setUsersNotActive(key.participant ?? key.remoteJid);
    }
  }
}
