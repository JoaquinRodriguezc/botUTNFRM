import { Injectable } from '@nestjs/common';
import { IaService } from '../ia/ia.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class IAWhatsappPluginService {
  private socket;
  private getText;
  private sendMessage;
  private membersLimit;
  constructor(
    private iaService: IaService,
    private configService: ConfigService,
  ) {
    this.membersLimit = 100;
  }

  public init(socket, getText, sendMessage) {
    this.socket = socket;
    this.getText = getText;
    this.sendMessage = sendMessage;
  }

  async process(key, message) {
    const text = this.getText(key, message);

    try {
      const grp = await this.socket.groupMetadata(key.remoteJid);
      const members = grp.participants;
      const response = await this.iaService.processChatStream(text);
      const mentions = [];
      const items = [];

      members.forEach(({ id, admin }) => {
        mentions.push(id);
        items.push('!' + id.slice(0, 13) + (admin ? '(admin)' : ''));
      });
      if (members.length < this.membersLimit)
        this.sendMessage(
          key.remoteJid,
          { text: response },
          { quoted: { key, message } },
        );
    } catch (err) {
      console.log('Error processing messages:', err);
    }
  }
}
