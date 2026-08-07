import { Inject, Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { DRIZZLE } from 'src/database/database.constants';
import { relations } from 'src/database/relations';
import * as schema from 'src/database/schema';

export type UserPublicKey = typeof schema.userPublicKeys.$inferSelect;
export type NewUserPublicKey = typeof schema.userPublicKeys.$inferInsert;

@Injectable()
export class UserKeyRepository {
  constructor(
    @Inject(DRIZZLE) private readonly db: PostgresJsDatabase<typeof relations>,
  ) {}

  async findById(id: number): Promise<UserPublicKey | null> {
    const [userPublicKey] = await this.db
      .select()
      .from(schema.userPublicKeys)
      .where(eq(schema.userPublicKeys.id, id))
      .limit(1);

    return userPublicKey ?? null;
  }

  async create(data: NewUserPublicKey): Promise<UserPublicKey> {
    const [userPublicKey] = await this.db
      .insert(schema.userPublicKeys)
      .values(data)
      .returning();

    return userPublicKey;
  }
}
