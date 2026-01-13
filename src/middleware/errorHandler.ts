import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError.js';
import { logger } from '../config/logger.js';
import { env } from '../config/environment.js';
import { sendError } from '../utils/response.js';

export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  _next: NextFunction,
) => {
  let statusCode = 500;
  let message = 'Internal Server Error';
  let error = err.message;

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
  }

  // Log the error
  logger.error(`${req.method} ${req.path} - ${statusCode} - ${err.message}`, {
    stack: err.stack,
    body: req.body,
    params: req.params,
    query: req.query,
  });

  // Hide sensitive info in production
  if (env.NODE_ENV === 'production' && !(err instanceof AppError)) {
    error = 'An unexpected error occurred';
  }

  return sendError(res, error, statusCode, message, (err as any).data);
};
