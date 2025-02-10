import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { IaService } from '../ia/ia.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class IAWhatsappPluginService {
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

  async process(key, message) {
    const text = this.getText(key, message);
    try {
      const response = await this.iaService.processChatStream(text);

      this.sendMessage(
        key.remoteJid,
        { text: response },
        { quoted: { key, message } },
      );
      this.setUsersNotActive(key.participant ?? key.remoteJid);
    } catch (err) {
      this.setUsersNotActive(key.participant ?? key.remoteJid);
      console.log('Error processing messages:', err);
    }
  }
}
