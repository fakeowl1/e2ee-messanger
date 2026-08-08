import { UseGuards } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtPayload, WsAuthGuard } from 'src/auth/guards/websocket.guards';
import { CreateNewSessionDto } from './dto/session.dto';
import { SessionService } from './session.service';
import { UserService } from 'src/user/user.service';

interface ClientData {
  user: JwtPayload;
  userId: number;
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

  constructor(
    public readonly sessionServ: SessionService,
    public readonly userServ: UserService,
  ) {}

  handleConnection(client: Socket): void {
    this.server.emit('room', client.id + ' joined!');
  }

  handleDisconnect(client: Socket): void {
    this.server.emit('room', client.id + ' left!');
  }

  @SubscribeMessage('newSession')
  async getUserPublicKey(
    @ConnectedSocket() client: Socket,
    @MessageBody() newSession: CreateNewSessionDto,
  ) {
    const data = client.data as ClientData;
    const user = await this.userServ.findByEmail(data.user.email);

    if (!user) {
      throw new WsException('User associated with token no longer exists.');
    }

    const session = await this.sessionServ.create(user.id, newSession);

    return session;
  }
}
