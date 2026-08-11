import { Injectable, Inject } from '@nestjs/common';
import { DRIZZLE } from 'src/database/database.constants';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { relations } from 'src/database/relations';
import * as schema from 'src/database/schema';
import { eq, gte, and } from 'drizzle-orm';
import { CreateNewSessionDto } from './dto/session.dto';
import { UserKeyService } from './user-key.service';

export type Session = typeof schema.sessions.$inferSelect;
export type NewSession = typeof schema.sessions.$inferInsert;

@Injectable()
export class SessionService {
  constructor(
    @Inject(DRIZZLE) private readonly db: PostgresJsDatabase<typeof relations>,
    private readonly userKeyService: UserKeyService,
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

    const sessionKey = await this.userKeyService.createUserPublicKey(
      userId,
      newSessionDto,
    );

    const sessionData: NewSession = {
      userKeyId: sessionKey.id,
      expireDate: expireDate,
    };

    const [session] = await this.db
      .insert(schema.sessions)
      .values(sessionData)
      .returning();

    return session;
  }
}
