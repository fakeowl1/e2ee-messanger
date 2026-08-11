import { Injectable, Inject } from '@nestjs/common';
import { DRIZZLE } from 'src/database/database.constants';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { relations } from 'src/database/relations';
import * as schema from 'src/database/schema';
import { eq } from 'drizzle-orm';
import { CreateNewSessionDto } from './dto/session.dto';

export type UserPublicKey = typeof schema.userPublicKeys.$inferSelect;
export type NewUserPublicKey = typeof schema.userPublicKeys.$inferInsert;

@Injectable()
export class UserKeyService {
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

  async createUserPublicKey(
    userId: number,
    dto: CreateNewSessionDto,
  ): Promise<UserPublicKey> {
    const userKeyData: NewUserPublicKey = {
      userId: userId,
      publicKey: dto.publicKey,
    };

    const [newUserKey] = await this.db
      .insert(schema.userPublicKeys)
      .values(userKeyData)
      .returning();

    return newUserKey;
  }
}
