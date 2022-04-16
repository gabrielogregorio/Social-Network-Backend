import { Request } from 'express';

export interface MiddlewareRequest extends Request {
  data: {
    id: string;
  };
}
