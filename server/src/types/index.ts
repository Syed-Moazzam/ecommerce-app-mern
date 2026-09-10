import { Request } from 'express';

export type UserRole = 'admin' | 'customer';

export interface AuthPayload {
  id: string;
  role: UserRole;
}

export interface AuthRequest extends Request {
  user?: AuthPayload;
}
