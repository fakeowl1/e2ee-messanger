import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ChatController } from './chat/chat.controller';
import { UserController } from './user/user.controller';
import { UsersService } from './user/user.service';
import { DatabaseModule } from './database/database.module';
import { UserRepository } from './user/user.repository';

@Module({
  imports: [DatabaseModule],
  controllers: [AppController, ChatController, UserController],
  providers: [AppService, UsersService, UserRepository],
})
export class AppModule { }
