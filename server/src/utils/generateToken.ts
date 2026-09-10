import jwt, { SignOptions } from 'jsonwebtoken';
import { env } from '../config/env';
import { UserRole } from '../types';

export const generateToken = (id: string, role: UserRole): string => {
  return jwt.sign({ id, role }, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn,
  } as SignOptions);
};
