import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { relations } from 'src/database/relations';
import { DRIZZLE } from 'src/database/database.constants';
import { CreateMessageDto } from './dtos/message.dto';
import * as schema from 'src/database/schema';
import { eq, sql } from 'drizzle-orm';

export type NewMessage = typeof schema.message.$inferInsert;

@Injectable()
export class MessageService {
  constructor(
    @Inject(DRIZZLE) private readonly db: PostgresJsDatabase<typeof relations>,
  ) {}

  async create(senderUserID: number, newMessageDto: CreateMessageDto) {
    const receiverUserId = newMessageDto.receiverUserID;

    const receiverIdResult = await this.db
      .select({
        exists: sql<number>`1`,
      })
      .from(schema.users)
      .where(eq(schema.users.id, receiverUserId))
      .limit(1);

    const receiverIdValid = receiverIdResult.length > 0;

    if (!receiverIdValid) {
      throw new BadRequestException({
        statusCode: 400,
        error: 'Bad Request',
        message: 'Invalid receiverId field',
        field: 'receiverId',
      });
    }

    const senderUserIdResult = await this.db
      .select({
        exists: sql<number>`1`,
      })
      .from(schema.users)
      .where(eq(schema.users.id, senderUserID))
      .limit(1);

    const senderUserIdValid = senderUserIdResult.length > 0;

    if (!senderUserIdValid) {
      throw new BadRequestException({
        statusCode: 400,
        error: 'Bad Request',
        message: 'Invalid senderUserId field',
        field: 'senderUserId',
      });
    }

    const userSessionResult = await this.db
      .select({ exists: sql<number>`1` })
      .from(schema.sessions)
      .where(eq(schema.sessions.ownerUserId, senderUserID))
      .limit(1);

    const isUserOwnsSession = userSessionResult.length > 0;

    if (!isUserOwnsSession) {
      throw new BadRequestException({
        statusCode: 400,
        error: 'Bad Request',
        message: "User don't own session",
        field: 'sessionId',
      });
    }

    const chatId = newMessageDto.chatId;
    const chatIdResult = await this.db
      .select({
        exists: sql<number>`1`,
      })
      .from(schema.users)
      .where(eq(schema.chats.id, chatId))
      .limit(1);

    const chatIdValid = chatIdResult.length > 0;

    if (!chatIdValid) {
      throw new BadRequestException({
        statusCode: 400,
        error: 'Bad Request',
        message: 'Invalid chatid field',
        field: 'chatId',
      });
    }

    const encryptedMessageText = newMessageDto.encryptedMessageText;
    const messageTimestamp = newMessageDto.timestamp;

    const newMessage: NewMessage = {
      senderId: senderUserID,
      receiverId: receiverUserId,
      chatId: chatId,
      encryptedText: encryptedMessageText,
      timestamp: messageTimestamp,
    };

    const [message] = await this.db
      .insert(schema.message)
      .values(newMessage)
      .returning();

    return message;
  }
}
