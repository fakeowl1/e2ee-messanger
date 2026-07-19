import { Inject, Injectable } from '@nestjs/common';
import { DRIZZLE } from '../database/database.constants';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { relations } from '../database/relations';
import * as schema from '../database/schema';
import { eq } from 'drizzle-orm';

export type User = typeof schema.users.$inferSelect;
export type NewUser = typeof schema.users.$inferInsert;

@Injectable()
export class UserRepository {
  constructor(
    @Inject(DRIZZLE) private readonly db: PostgresJsDatabase<typeof relations>,
  ) {}
  async findAll(): Promise<User[]> {
    return this.db.select().from(schema.users);
  }

  async findById(id: number): Promise<User | null> {
    const [user] = await this.db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, id))
      .limit(1);

    return user ?? null;
  }

  async findByUserName(userName: string): Promise<User | null> {
    const [user] = await this.db
      .select()
      .from(schema.users)
      .where(eq(schema.users.userName, userName))
      .limit(1);

    return user ?? null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const [user] = await this.db
      .select()
      .from(schema.users)
      .where(eq(schema.users.email, email))
      .limit(1);

    return user ?? null;
  }

  async create(data: NewUser): Promise<User> {
    const [user] = await this.db.insert(schema.users).values(data).returning();

    return user;
  }
}
