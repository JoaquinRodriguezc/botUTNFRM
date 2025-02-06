import makeWASocket, {
  DisconnectReason,
  useMultiFileAuthState,
  WASocket,
  proto,
} from '@whiskeysockets/baileys';
import { TagEveryone } from './wa.plugin.service';
import { Inject } from '@nestjs/common';
import { IAWhatsappPluginService } from './ia.plugin.service';
export class WaService {
  private socket;
  private messageStore: any = {};
  private emptyChar: string = '‎ ';
  private authFolder: string;
  private selfReply: boolean;
  private saveCredentials!: () => Promise<void>;
  private logMessages: boolean;
  private plugins;

  constructor(
    @Inject() private tagEveryone: TagEveryone,
    private wspIaService: IAWhatsappPluginService,
  ) {
    this.plugins = [tagEveryone, wspIaService];
    this.authFolder = 'auth';
    this.selfReply = false;
    this.logMessages = true;
  }

  async connect(): Promise<void> {
    const { state, saveCreds } = await useMultiFileAuthState(this.authFolder);
    this.saveCredentials = saveCreds;

    this.socket = makeWASocket({
      printQRInTerminal: true,
      auth: state,
      getMessage: this.getMessageFromStore as any,
    });

    this.plugins.forEach((plugin) =>
      plugin.init(
        this.socket,
        this.getText.bind(this),
        this.sendMessage.bind(this),
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

        if (this.logMessages) console.log('msg upsert', messages);

        messages.forEach(async (msg) => {
          const { key, message } = msg;
          let mentions =
            message?.extendedTextMessage?.contextInfo?.mentionedJid;

          if (mentions) {
            mentions = mentions.map((mention) => mention.split('@')[0]);
          }
          console.log('User', this.getBotId());
          console.log('Mentions', mentions);
          if (mentions?.length > 0) {
            console.log('son iguales', this.getBotId() === mentions[0]);
          }
          const findMe = mentions?.find((m) => m === this.getBotId());
          console.log('yo?', findMe);
          if (findMe) {
            console.log('He sido mencionado', mentions, this.getBotId());
            if (!message || this.getText(key, message).includes(this.emptyChar))
              return;
            this.plugins.forEach((plugin) => plugin.process(key, message));
          }
        });
      }
    });
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
    return this.socket.user?.id.split(':')[0];
  }
  private getText(key: proto.IMessageKey, message: proto.IMessage): string {
    try {
      let text =
        message.conversation || message.extendedTextMessage?.text || '';

      if (key.participant) {
        const me = key.participant.slice(0, 12);
        text = text.replace(/\@me\b/g, `@${me}`);
      }

      return text;
    } catch (err) {
      return '';
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
}
