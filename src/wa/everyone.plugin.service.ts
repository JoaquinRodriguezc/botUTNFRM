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
    this.membersLimit = 1024;
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

    if (!isGroupMessage(key)) return;
    const isAdmin = await isParticipantAdmin(this.socket, key);
    console.log(isAdmin);
    if (!isAdmin) {
      console.log();
      console.log('Participant does not have rights to execute this command');
      console.log('user is not admin');
      this.setUsersNotActive(key.participant);
      return;
    }

    try {
      const grp = await this.socket.groupMetadata(key.remoteJid);
      const members = grp.participants;

      const mentions = [];

      members.forEach(({ id, admin }) => {
        mentions.push(id);
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
