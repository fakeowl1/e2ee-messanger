import { defineRelations } from 'drizzle-orm';
import * as schema from './schema';

export const relations = defineRelations(schema, (r) => ({
  users: {
    sentMessages: r.many.message({
      from: r.users.id,
      to: r.message.senderId,
    }),
    receivedMessages: r.many.message({
      from: r.users.id,
      to: r.message.recieverId,
    }),
  },
  message: {
    sender: r.one.users({
      from: r.message.senderId,
      to: r.users.id,
    }),
    receiver: r.one.users({
      from: r.message.recieverId,
      to: r.users.id,
    }),
  },
}));
