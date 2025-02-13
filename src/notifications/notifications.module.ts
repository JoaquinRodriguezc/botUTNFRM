// src/notifications/notifications.module.ts
// Módulo para NestJS

import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
//import { NotificationsGateway } from './notifications.gateway';

@Module({
  providers: [NotificationsService],
  controllers: [NotificationsController],
  exports: [NotificationsService], // Para que otros módulos puedan usarlo
})
export class NotificationsModule {}
