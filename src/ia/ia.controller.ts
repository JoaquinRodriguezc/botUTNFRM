import { Controller, Post, Body } from '@nestjs/common';
import { IaService } from './ia.service';

interface ChatRequest {
  prompt: string;
  phoneNumber: string; // Ahora requerimos el número de teléfono
}

@Controller('chat')
export class IaController {
  constructor(private readonly iaService: IaService) {}

  @Post()
  async chat(@Body() body: ChatRequest) {
    if (!body.phoneNumber) {
      throw new Error(
        'Se requiere un número de teléfono para mantener el contexto de la conversación',
      );
    }

    // Normalizar el número de teléfono (eliminar espacios, guiones, etc.)
    const normalizedPhone = this.normalizePhoneNumber(body.phoneNumber);

    return await this.iaService.processChatStream(body.prompt, normalizedPhone);
  }

  private normalizePhoneNumber(phone: string): string {
    // Eliminar todos los caracteres no numéricos
    const cleaned = phone.replace(/\D/g, '');

    // Asegurarse de que tenga el formato correcto (ejemplo: 549261234567)
    if (!cleaned.startsWith('549')) {
      return `549${cleaned}`;
    }

    return cleaned;
  }
}
