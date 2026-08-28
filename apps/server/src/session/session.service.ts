import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { DRIZZLE } from 'src/database/database.constants';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { relations } from 'src/database/relations';
import * as schema from 'src/database/schema';
import { eq, gte, and, sql } from 'drizzle-orm';
import { CreateNewSessionDto } from '../session/dtos/session.dto';

export type Session = typeof schema.sessions.$inferSelect;
export type NewSession = typeof schema.sessions.$inferInsert;

@Injectable()
export class SessionService {
  constructor(
    @Inject(DRIZZLE) private readonly db: PostgresJsDatabase<typeof relations>,
  ) {}

  async findById(id: number): Promise<Session | null> {
    const [session] = await this.db
      .select()
      .from(schema.sessions)
      .where(eq(schema.sessions.id, id))
      .limit(1);

    return session ?? null;
  }

  async findActiveByUserKeyId(userKeyId: number): Promise<Session | null> {
    const today = new Date();
    const [session] = await this.db
      .select()
      .from(schema.sessions)
      .where(
        and(
          eq(schema.sessions.userKeyId, userKeyId),
          gte(schema.sessions.expireDate, today),
        ),
      )
      .limit(1);

    return session ?? null;
  }

  async create(userId: number, newSessionDto: CreateNewSessionDto) {
    const expireDate = new Date();
    expireDate.setMonth(expireDate.getMonth() + 1);

    const userIdResult = await this.db
      .select({
        exists: sql<number>`1`,
      })
      .from(schema.users)
      .where(eq(schema.users.id, userId))
      .limit(1);

    const userIdValid = userIdResult.length > 0;

    if (!userIdValid) {
      throw new BadRequestException({
        statusCode: 400,
        error: 'Bad Request',
        message: 'User associated with userId is not exist',
      });
    }

    const [userKey] = await this.db
      .insert(schema.userPublicKeys)
      .values({
        userId: userId,
        publicKey: newSessionDto.publicKey,
      })
      .returning();

    const sessionData: NewSession = {
      userKeyId: userKey.id,
      ownerUserId: userId,
      expireDate: expireDate,
    };

    const [session] = await this.db
      .insert(schema.sessions)
      .values(sessionData)
      .returning();

    return session;
  }
}
