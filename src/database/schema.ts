import { pgTable as table } from 'drizzle-orm/pg-core';
import * as t from 'drizzle-orm/pg-core';

export const sessionStatusEnum = t.pgEnum('session_status', [
  'active',
  'expired',
  'revoked',
]);

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
  senderId: t
    .integer('sender_id')
    .references(() => users.id)
    .notNull(),
  receiverId: t
    .integer('receiver_id')
    .references(() => users.id)
    .notNull(),
  chatId: t
    .integer('chat_id')
    .references(() => chats.id)
    .notNull(),
  encryptedText: t.text('encrypted_message').notNull(),
  timestamp: t.timestamp('timestamp').notNull(),
});

export const chats = table('users_chats', {
  id: t.integer().primaryKey().generatedAlwaysAsIdentity(),
  createdAt: t.timestamp('created_at').notNull().defaultNow(),
});

export const userPublicKeys = table('user_public_keys', {
  id: t.integer().primaryKey().generatedAlwaysAsIdentity(),
  userId: t
    .integer('user_id')
    .references(() => users.id)
    .notNull(),
  publicKey: t.text('user_public_key').notNull(),
});

export const sessions = table('users_sessions', {
  id: t.integer().primaryKey().generatedAlwaysAsIdentity(),
  ownerUserId: t
    .integer('owner_user_id')
    .references(() => users.id)
    .notNull(),
  userKeyId: t
    .integer('user_key_id')
    .references(() => userPublicKeys.id)
    .notNull(),
  status: sessionStatusEnum('status').notNull().default('active'),
  expireDate: t.timestamp('expire_date').notNull(),
});
