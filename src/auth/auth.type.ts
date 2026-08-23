import type { Request } from 'express';

export type RequestWithJwtUser = Request & {
  user: {
    sub: number;
    email: string;
  };
};

export type RequestWithLocalUser = Request & {
  user: {
    id: number;
    email: string;
  };
};
