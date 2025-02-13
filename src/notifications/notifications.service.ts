// src/notifications/notifications.service.ts
// Lógica para manejar los datos

import * as fs from 'fs';
import { Injectable } from '@nestjs/common';

@Injectable()
export class NotificationsService {
  private filePath = './src/notifications/notifications.json';

  constructor() {
    // Si el archivo no existe, crearlo
    if (!fs.existsSync(this.filePath)) {
      fs.writeFileSync(this.filePath, JSON.stringify([]));
    }
  }

  // Obtener notificaciones
  getNotifications(): any[] {
    const data = fs.readFileSync(this.filePath, 'utf-8');
    return JSON.parse(data);
  }

  // Agregar una nueva notificación
  addNotification(date: string, reason: string) {
    const notifications = this.getNotifications();
    notifications.push({ date, reason });
    fs.writeFileSync(this.filePath, JSON.stringify(notifications, null, 2));
    return {
      message: `✅ Se ha registrado la suspensión de clases el ${date}: ${reason}`,
    };
  }

  // Verificar si hoy hay clases
  checkIfClassIsSuspended(): string | null {
    const today = new Date().toISOString().split('T')[0];
    const notifications = this.getNotifications();
    const suspension = notifications.find((n) => n.date === today);
    return suspension
      ? `⚠️ Hoy NO hay clases. Motivo: ${suspension.reason}`
      : null;
  }
}
