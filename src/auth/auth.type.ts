import type { Request } from 'express';

export type requestWithUser = Request & {
  user: {
    id: string;
    email: string;
  };
};
