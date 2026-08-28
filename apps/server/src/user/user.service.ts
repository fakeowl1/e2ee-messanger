import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { DRIZZLE } from 'src/database/database.constants';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { relations } from 'src/database/relations';
import * as schema from 'src/database/schema';
import { eq } from 'drizzle-orm';

export type User = typeof schema.users.$inferSelect;
export type NewUser = typeof schema.users.$inferInsert;

@Injectable()
export class UserService {
  constructor(
    @Inject(DRIZZLE) private readonly db: PostgresJsDatabase<typeof relations>,
  ) {}

  async findAll() {
    return this.db.select().from(schema.users);
  }

  async findByUsername(userName: string) {
    const [user] = await this.db
      .select()
      .from(schema.users)
      .where(eq(schema.users.userName, userName))
      .limit(1);

    return user ?? null;
  }

  async findByEmail(email: string) {
    const [user] = await this.db
      .select()
      .from(schema.users)
      .where(eq(schema.users.email, email))
      .limit(1);

    return user ?? null;
  }

  async findById(id: number) {
    const [user] = await this.db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, id))
      .limit(1);

    return user ?? null;
  }

  async userNameIsAvailable(userName: string) {
    const isUserExists = await this.findByUsername(userName);

    if (isUserExists) {
      throw new BadRequestException('Username is occupied');
    }
  }

  async emailIsAvailable(email: string) {
    const isUserExists = await this.findByEmail(email);

    if (isUserExists) {
      throw new BadRequestException('Email is occupied');
    }
  }

  async create(data: NewUser) {
    const [user] = await this.db.insert(schema.users).values(data).returning();

    return user;
  }
}
