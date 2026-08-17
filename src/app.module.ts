import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserController } from './user/user.controller';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { ChatModule } from './chat/chat.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

import type { StringValue } from 'ms';
import { SessionModule } from './session/session.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    JwtModule.registerAsync({
      global: true,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        return {
          secret: config.getOrThrow<string>('JWT_SECRET'),
          signOptions: {
            expiresIn: config.getOrThrow<string | number>(
              'JWT_EXPIRE',
            ) as StringValue,
          },
        };
      },
    }),
    DatabaseModule,
    AuthModule,
    UserModule,
    ChatModule,
    SessionModule,
  ],
  controllers: [AppController, UserController],
  providers: [AppService],
  exports: [JwtModule],
})
export class AppModule {}
