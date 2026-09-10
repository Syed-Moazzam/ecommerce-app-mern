import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/ApiError';

export const notFound = (req: Request, _res: Response, next: NextFunction): void => {
  next(new ApiError(404, `Route not found: ${req.originalUrl}`));
};

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): void => {
  let statusCode = err instanceof ApiError ? err.statusCode : 500;
  let message = err.message || 'Server Error';

  // Mongoose duplicate key
  if (err.name === 'MongoServerError' && (err as unknown as { code?: number }).code === 11000) {
    statusCode = 409;
    message = 'A record with that value already exists';
  }
  if (err.name === 'ValidationError') {
    statusCode = 400;
  }
  if (err.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid resource identifier';
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' ? { stack: err.stack } : {}),
  });
};
