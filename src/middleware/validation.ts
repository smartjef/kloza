import { Request, Response, NextFunction } from 'express';
import { ZodTypeAny, ZodError } from 'zod';
import { ValidationError } from '../utils/AppError.js';

export const validate = (schema: ZodTypeAny) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      return next();
    } catch (error) {
      if (error instanceof ZodError) {
        const message = error.issues && error.issues.length > 0
          ? error.issues
            .map((err: any) => `${err.path.join('.')}: ${err.message}`)
            .join(', ')
          : error.message || 'Validation error';
        return next(new ValidationError(message));
      }
      return next(error);
    }
  };
};
