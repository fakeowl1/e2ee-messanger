import { Inject, Injectable } from '@nestjs/common';
import { and, eq, gte } from 'drizzle-orm';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { DRIZZLE } from 'src/database/database.constants';
import { relations } from 'src/database/relations';
import * as schema from 'src/database/schema';

export type Session = typeof schema.sessions.$inferSelect;
export type NewSession = typeof schema.sessions.$inferInsert;

@Injectable()
export class SessionRepository {
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

  async create(data: NewSession): Promise<Session> {
    const [session] = await this.db
      .insert(schema.sessions)
      .values(data)
      .returning();

    return session;
  }
}
