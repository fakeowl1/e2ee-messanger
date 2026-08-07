import { Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { DatabaseModule } from 'src/database/database.module';
import { SessionRepository } from './session.repository';
import { UserKeyRepository } from './user-key.repository';
import { SessionService } from './session.service';
import { UserKeyService } from './user-key.service';
import { UserService } from 'src/user/user.service';
import { UserRepository } from 'src/user/user.repository';
import { WsAuthGuard } from 'src/auth/guards/websocket.guard';

@Module({
  imports: [DatabaseModule],
  providers: [
    ChatGateway,
    WsAuthGuard,
    SessionRepository,
    UserKeyRepository,
    SessionService,
    UserKeyService,
    UserService,
    UserRepository,
  ],
})
export class ChatModule {}
