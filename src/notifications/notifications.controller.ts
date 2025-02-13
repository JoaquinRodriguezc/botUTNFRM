// src/notifications/notifications.controller.ts
// Endpoints para agregar/ver notificaciones

import { Controller, Get, Post, Body } from '@nestjs/common';
import { NotificationsService } from './notifications.service';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  getNotifications() {
    return this.notificationsService.getNotifications();
  }

  @Post('add')
  addNotification(@Body() body: { date: string; reason: string }) {
    return this.notificationsService.addNotification(body.date, body.reason);
  }
}
