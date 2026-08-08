import { pgTable as table } from 'drizzle-orm/pg-core';
import * as t from 'drizzle-orm/pg-core';

export const users = table('users', {
  id: t.integer().primaryKey().generatedAlwaysAsIdentity(),
  firstName: t.varchar('first_name', { length: 256 }).notNull(),
  userName: t.varchar('username', { length: 256 }).notNull().unique(),
  email: t.varchar().notNull().unique(),
  hashedPassword: t.varchar('hashed_password').notNull(),
  hashedSalt: t.varchar('hashed_salt').notNull(),
});

export const message = table('users_message', {
  id: t.integer().primaryKey().generatedAlwaysAsIdentity(),
  senderId: t.integer('sender_id').references(() => users.id),
  recieverId: t.integer('reciever_id').references(() => users.id),
  encryptedText: t.varchar('encrypted_message', { length: 1024 }).notNull(),
  createdAt: t.timestamp('created_at').notNull().defaultNow(),
});

export const userPublicKeys = table('user_public_keys', {
  id: t.integer().primaryKey().generatedAlwaysAsIdentity(),
  userId: t.integer('user_id').references(() => users.id),
  publicKey: t.varchar().notNull(),
});

export const sessions = table('users_sessions', {
  id: t.integer().generatedAlwaysAsIdentity(),
  userKeyId: t.integer('users_public_keys').references(() => userPublicKeys.id),
  expireDate: t.date('expire_date', { mode: 'date' }).notNull(),
});
