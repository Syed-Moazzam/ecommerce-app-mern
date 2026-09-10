import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { AuthPayload } from '../types';
import { ApiError } from '../utils/ApiError';

export const protect = (req: Request, _res: Response, next: NextFunction): void => {
  let token: string | undefined;
  const header = req.headers.authorization;
  if (header && header.startsWith('Bearer ')) {
    token = header.split(' ')[1];
  }
  if (!token) {
    throw new ApiError(401, 'Not authorized, no token provided');
  }
  try {
    const decoded = jwt.verify(token, env.jwtSecret) as AuthPayload;
    req.user = { id: decoded.id, role: decoded.role };
    next();
  } catch {
    throw new ApiError(401, 'Not authorized, token failed');
  }
};

export const adminOnly = (req: Request, _res: Response, next: NextFunction): void => {
  if (req.user?.role !== 'admin') {
    throw new ApiError(403, 'Admin access required');
  }
  next();
};
