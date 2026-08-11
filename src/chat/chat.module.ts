import { Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { DatabaseModule } from 'src/database/database.module';
import { SessionService } from './session.service';
import { UserKeyService } from './user-key.service';
import { UserService } from 'src/user/user.service';
import { WsAuthGuard } from 'src/auth/guards/websocket.guards';

@Module({
  imports: [DatabaseModule],
  providers: [
    ChatGateway,
    WsAuthGuard,
    SessionService,
    UserKeyService,
    UserService,
  ],
})
export class ChatModule {}
