/* //src/notificactions/notifications.gateway.ts
    // Manejar la comunicación en tiempo real de prueba pero hay problemas con las dependencias


import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { NotificationsService } from './notifications.service';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class NotificationsGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;

  constructor(private readonly notificationsService: NotificationsService) {}

  afterInit(server: Server) {
    console.log('WebSocket server initialized');
  }

  handleConnection(client: Socket, ...args: any[]) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('getNotifications')
  handleGetNotifications(@MessageBody() data: any): void {
    const notifications = this.notificationsService.getNotifications();
    this.server.emit('notifications', notifications);
  }

  @SubscribeMessage('addNotification')
  handleAddNotification(
    @MessageBody() data: { date: string; reason: string },
  ): void {
    const notification = this.notificationsService.addNotification(
      data.date,
      data.reason,
    );
    this.server.emit('notificationAdded', notification);
  }
}
 */
