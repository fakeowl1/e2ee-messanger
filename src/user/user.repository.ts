import { Inject, Injectable } from '@nestjs/common';
import { DRIZZLE } from '../database/database.constants';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import * as schema from '../database/schema';
import { eq } from 'drizzle-orm';

@Injectable()
export class UserRepository {
  constructor(
    @Inject(DRIZZLE) private readonly db: PostgresJsDatabase<typeof schema>,
  ) { }

  async findAll() {
    return this.db.select().from(schema.users);
  }

  async findById(id: number) {
    const [user] = await this.db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, id))
      .limit(1);

    return user ?? null;
  }

  async findByUserName(userName: string) {
    const [user] = await this.db
      .select()
      .from(schema.users)
      .where(eq(schema.users.userName, userName))
      .limit(1);

    return user ?? null;
  }

  async create(
    firstName: string,
    userName: string,
    hashedPassword: string,
    hashedSalt: string,
  ) {
    const [user] = await this.db
      .insert(schema.users)
      .values({
        firstName,
        userName,
        hashedPassword,
        hashedSalt,
      })
      .returning();

    return user;
  }
}
