import { UseGuards } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtPayload, WsAuthGuard } from 'src/auth/guards/websocket.guards';
import { CreateMessageDto } from './dtos/message.dto';
import { MessageService } from './message.service';

interface ClientData {
  user: JwtPayload;
}

@WebSocketGateway(3001, {
  cors: {
    origin: '*',
    credentials: true,
  },
})
@UseGuards(WsAuthGuard)
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(public readonly messageServ: MessageService) {}

  handleConnection(client: Socket): void {
    this.server.emit('room', client.id + ' joined!');
  }

  handleDisconnect(client: Socket): void {
    this.server.emit('room', client.id + ' left!');
  }

  @SubscribeMessage('sendMessage')
  async newMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() newMessageDto: CreateMessageDto,
  ) {
    const data = client.data as ClientData;

    const message = await this.messageServ.create(data.user.sub, newMessageDto);

    return message;
  }
}
