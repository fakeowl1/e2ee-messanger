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
      to: r.message.recieverId,
      alias: 'sentMessage',
    }),
    userKeys: r.many.userPublicKeys({
      from: r.users.id,
      to: r.userPublicKeys.userId,
    }),
  },

  message: {
    sender: r.one.users({
      from: r.message.senderId,
      to: r.users.id,
      alias: 'sentMessage',
    }),
    receiver: r.one.users({
      from: r.message.recieverId,
      to: r.users.id,
      alias: 'receivedMessages',
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
    userKey: r.one.userPublicKeys({
      from: r.sessions.userKeyId,
      to: r.userPublicKeys.id,
    }),
  },
}));
