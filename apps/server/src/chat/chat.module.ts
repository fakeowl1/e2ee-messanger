import { Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { DatabaseModule } from 'src/database/database.module';
import { UserService } from 'src/user/user.service';
import { WsAuthGuard } from 'src/auth/guards/websocket.guards';
import { MessageService } from './message.service';

@Module({
  imports: [DatabaseModule],
  providers: [ChatGateway, WsAuthGuard, UserService, MessageService],
})
export class ChatModule {}
