import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { IaService } from '../ia/ia.service';
import { ConfigService } from '@nestjs/config';

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

  private normalizePhoneNumber(jid: string): string {
    // Extraer solo los números del JID de WhatsApp (ejemplo: "549261234567@s.whatsapp.net" -> "549261234567")
    return jid.split('@')[0];
  }

  public isUserActive(userId: string): boolean {
    return this.activeUsers.get(userId) || false;
  }

  async process(key, message, text: string) {
    try {
      const userId = this.normalizePhoneNumber(key.remoteJid);

      // No verificamos aquí si está activo, ya que WaService ya lo hizo
      this.activeUsers.set(userId, true);

      const response = await this.iaService.processChatStream(text, userId);

      this.sendMessage(
        key.remoteJid,
        { text: response },
        { quoted: { key, message } },
      );
    } catch (err) {
      console.log('Error processing messages:', err);
    } finally {
      const userId = this.normalizePhoneNumber(key.remoteJid);
      this.activeUsers.delete(userId);
      this.setUsersNotActive(userId);
    }
  }
}
