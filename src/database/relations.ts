import { defineRelations } from 'drizzle-orm';
import * as schema from './schema';

export const relations = defineRelations(schema, (r) => ({
  users: {
    sentMessages: r.many.message({
      from: r.users.id,
      to: r.message.senderId,
      alias: 'sentMessage',
    }),
    receivedMessages: r.many.message({
      from: r.users.id,
      to: r.message.receiverId,
      alias: 'receivedMessage',
    }),
    userKeys: r.many.userPublicKeys({
      from: r.users.id,
      to: r.userPublicKeys.userId,
    }),
    sessions: r.many.sessions({
      from: r.users.id,
      to: r.sessions.ownerUserId,
    }),
  },

  message: {
    sender: r.one.users({
      from: r.message.senderId,
      to: r.users.id,
      alias: 'sentMessage',
    }),
    receiver: r.one.users({
      from: r.message.receiverId,
      to: r.users.id,
      alias: 'receivedMessage',
    }),
    chat: r.one.chats({
      from: r.message.chatId,
      to: r.chats.id,
    }),
  },

  chats: {
    messages: r.many.message({
      from: r.chats.id,
      to: r.message.chatId,
    }),
  },

  userPublicKeys: {
    user: r.one.users({
      from: r.userPublicKeys.userId,
      to: r.users.id,
    }),
    sessions: r.many.sessions({
      from: r.userPublicKeys.id,
      to: r.sessions.userKeyId,
    }),
  },

  sessions: {
    owner: r.one.users({
      from: r.sessions.ownerUserId,
      to: r.users.id,
    }),
    userKey: r.one.userPublicKeys({
      from: r.sessions.userKeyId,
      to: r.userPublicKeys.id,
    }),
  },
}));
