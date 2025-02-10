import { Injectable } from '@nestjs/common';
import { isGroupMessage, isParticipantAdmin } from './utils/utils';

@Injectable()
export class TagEveryoneService {
  private socket;
  private getText;
  private sendMessage;
  private membersLimit;
  private trigger;
  private setUsersNotActive;
  constructor() {
    this.membersLimit = 100;
    this.trigger = 'all';
  }

  public init(socket, getText, sendMessage, setUsersNotActive) {
    this.socket = socket;
    this.getText = getText;
    this.sendMessage = sendMessage;
    this.setUsersNotActive = setUsersNotActive;
  }

  async process(key, message) {
    const text = this.getText(key, message);

    if (!text.toLowerCase().includes('@' + this.trigger)) return;

    if (!isGroupMessage(key) || isParticipantAdmin(this.socket, key)) return;

    try {
      const grp = await this.socket.groupMetadata(key.remoteJid);
      const members = grp.participants;

      const mentions = [];
      const items = [];

      members.forEach(({ id, admin }) => {
        mentions.push(id);
        items.push('@' + id.slice(0, 13) + (admin ? '(admin)' : ''));
      });

      if (members.length < this.membersLimit)
        this.sendMessage(
          key.remoteJid,
          { text: `Mencionando a todos.`, mentions },
          { quoted: { key, message } },
        );
      this.setUsersNotActive(key.participant);
    } catch (err) {}
  }
}
