import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { ValidationError } from '../utils/errors';

export function validateBody(schema: ZodSchema) {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      req.body = await schema.parseAsync(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError || (error as any)?.name === 'ZodError') {
        const issues = (error as any).issues || (error as any).errors || [];
        const formattedErrors = issues.map((err: any) => ({
          field: Array.isArray(err.path) ? err.path.join('.') : String(err.path || ''),
          message: err.message,
        }));
        return next(new ValidationError('Request validation failed', formattedErrors));
      }
      next(error);
    }
  };
}

export function validateQuery(schema: ZodSchema) {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      req.query = (await schema.parseAsync(req.query)) as any;
      next();
    } catch (error) {
      if (error instanceof ZodError || (error as any)?.name === 'ZodError') {
        const issues = (error as any).issues || (error as any).errors || [];
        const formattedErrors = issues.map((err: any) => ({
          field: Array.isArray(err.path) ? err.path.join('.') : String(err.path || ''),
          message: err.message,
        }));
        return next(new ValidationError('Query parameter validation failed', formattedErrors));
      }
      next(error);
    }
  };
}

export function validateParams(schema: ZodSchema) {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      req.params = (await schema.parseAsync(req.params)) as any;
      next();
    } catch (error) {
      if (error instanceof ZodError || (error as any)?.name === 'ZodError') {
        const issues = (error as any).issues || (error as any).errors || [];
        const formattedErrors = issues.map((err: any) => ({
          field: Array.isArray(err.path) ? err.path.join('.') : String(err.path || ''),
          message: err.message,
        }));
        return next(new ValidationError('URL parameter validation failed', formattedErrors));
      }
      next(error);
    }
  };
}
