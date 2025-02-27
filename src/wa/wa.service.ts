/**
 * TO DO: IMPROVE THIS SERVICE AND MODULE@
 */
import makeWASocket, {
  DisconnectReason,
  useMultiFileAuthState,
  WASocket,
  proto,
  getContentType,
} from '@whiskeysockets/baileys';
import { TagEveryoneService } from './everyone.plugin.service';
import { Inject } from '@nestjs/common';
import { IAWhatsappPluginService } from './ia.plugin.service';
import { ConfigService } from '@nestjs/config';
import * as fs from 'node:fs/promises';
import { isGroupMessage } from './utils/utils';
import { NotificationsService } from '../notifications/notifications.service';
import { SourceTelephoneService } from 'src/source/telephones/source.telephones.service';

export class WaService {
  private socket;
  private messageStore: any = {};
  private emptyChar: string = '‎ ';
  private authFolder: string;
  private selfReply: boolean;
  private saveCredentials!: () => Promise<void>;
  private logMessages: boolean;
  private plugins;
  private bannedUsers: string[];
  private usersActive: string[];
  constructor(
    @Inject() private tagEveryoneService: TagEveryoneService,
    private wspIaService: IAWhatsappPluginService,
    private configService: ConfigService,
    private notificationService: NotificationsService,
    private readonly sourceTelephoneService: SourceTelephoneService,
  ) {
    this.plugins = [tagEveryoneService, wspIaService];
    this.authFolder = 'auth';
    this.selfReply = false;
    this.logMessages = true;
    this.usersActive = [];
    this.restart();
    this.loadBannedUsers();
  }
  async loadBannedUsers() {
    try {
      const file = await fs.readFile('./bannedUsers.json');
      this.bannedUsers = JSON.parse(file.toString());
    } catch (e) {
      this.bannedUsers = [];
    }
  }
  async connect(): Promise<void> {
    const { state, saveCreds } = await useMultiFileAuthState(this.authFolder);
    this.saveCredentials = saveCreds;

    this.socket = makeWASocket({
      printQRInTerminal: true,
      auth: state,
    });

    this.plugins.forEach((plugin) =>
      plugin.init(
        this.socket,
        this.getText.bind(this),
        this.sendMessage.bind(this),
        this.setUsersNotActive.bind(this),
      ),
    );
  }

  async run(): Promise<void> {
    this.socket.ev.process(async (events) => {
      if (events['connection.update']) {
        const update = events['connection.update'];
        const { connection, lastDisconnect } = update;

        if (connection === 'close') {
          if (
            lastDisconnect?.error?.output?.statusCode ===
            DisconnectReason.loggedOut
          ) {
            console.log('Connection closed. You are logged out.');
          } else if (
            lastDisconnect?.error?.output?.statusCode ===
            DisconnectReason.timedOut
          ) {
            console.log(
              new Date().toLocaleTimeString(),
              'Timed out. Will retry in 1 minute.',
            );
            setTimeout(this.restart.bind(this), 60 * 1000);
          } else {
            this.restart();
          }
        }
      }

      if (events['creds.update']) {
        await this.saveCredentials();
      }

      if (events['messages.upsert']) {
        const { messages } = events['messages.upsert'];

        for (const msg of messages) {
          const { key, message } = msg;
          const handle = this.shouldHandle({ key, message });
          if (!handle) return;
          console.log(`Handling message for ${key}: ${message}`);

          let text = this.getText(key, message);

          const botNumber = this.getBotId();

          if (text.includes('@all')) {
            this.tagEveryoneService.process(key, message);
            return;
          }
          text = text.replace('@' + botNumber, '');

          this.wspIaService.process(key, message, text);
        }
      }
    });
  }
  public setUsersNotActive(userKey: string) {
    this.usersActive = this.usersActive.filter((u) => u !== userKey);
  }

  private shouldHandle({ key, message }) {
    /**
     * if message is 10 seconds old bot will ignore msg
     */

    const text = this.getText(key, message);
    const msgTyp =
      getContentType(message) === 'conversation' ||
      getContentType(message) === 'extendedTextMessage';
    const contains = this.getText(key, message).includes(this.emptyChar);
    if (
      !message ||
      contains ||
      text.length > 90 ||
      this.isBanned(key) ||
      !msgTyp
    ) {
      return false;
    }

    const maxDelay = new Date().valueOf() - 10 * 1000;
    if (message?.timestamp > maxDelay) {
      return false;
    }

    const isOnGoingResponse = this.userHasOnGoingResponse(
      key.participant ?? key.remoteJid,
    );

    if (isOnGoingResponse) {
      console.log(
        `User ${key.participant ?? key.remoteJid} has ongoing response. Ignoring message`,
      );
      return false;
    }
    const isAGroupMessage = isGroupMessage(key);

    if (isAGroupMessage) {
      let mentions = message?.extendedTextMessage?.contextInfo?.mentionedJid;

      if (mentions) {
        mentions = mentions.map((mention) => mention.split('@')[0]);
      }

      const itsMe = mentions?.find((m) => m === this.getBotId());
      if (!itsMe) return;
    }
    this.setUserActive(key.participant ?? key.remoteJid);
    return true;
  }
  private setUserActive(userKey: string) {
    this.usersActive.push(userKey);
  }
  private isBanned(key) {
    return this.bannedUsers.includes(key.participant);
  }
  private userHasOnGoingResponse(userId: string): boolean {
    // Usar el estado del plugin para verificar si el usuario está activo
    return this.wspIaService.isUserActive(userId);
  }
  private async restart(): Promise<void> {
    await this.connect();
    await this.run();
  }

  private getMessageFromStore = (
    key: proto.IMessageKey,
  ): proto.IMessage | undefined => {
    return this.messageStore[key.id!];
  };
  private getBotId() {
    return this.configService.getOrThrow('BOT_NUMBER');
  }
  private getText(key: proto.IMessageKey, message: proto.IMessage): string {
    try {
      let text =
        message.conversation || message.extendedTextMessage?.text || '';

      if (key.participant) {
        const me = key.participant.slice(0, 12);
        text = text.replace(/\@me\b/g, `@${me}`);
      }
      console.log(text);
      return text;
    } catch (err) {
      return '';
    }
  }
  async banUser({ message, key }) {
    try {
      console.log(key);
      this.bannedUsers.push(key.participant ?? key.remoteJid);
      fs.writeFile('./bannedUsers.json', JSON.stringify(this.bannedUsers));
      console.log(`User  ${key} has been banned. Message: ${message}`);
    } catch (error) {
      console.log('Error banning user: ', key);
    }
  }
  private async sendMessage(
    jid: string,
    content: any,
    ...args: any[]
  ): Promise<void> {
    try {
      if (!this.selfReply) content.text = (content.text || '') + this.emptyChar;
      const sent = await this.socket.sendMessage(jid, content, ...args);
      this.messageStore[sent.key.id!] = sent;
    } catch (err) {
      console.log('Error sending message', err);
    }
  }

  async notifySuspension(date: string, reason: string) {
    return this.notificationService.addNotification(date, reason);
  }
}

type Message = {
  key: {
    remoteJid: string;
    fromMe: boolean;
    id: string;
    participant: string;
  };
  messageTimestamp: number;
  pushName: string;
  broadcast: boolean;
  message: any;
};
