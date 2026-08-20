import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';
import { ApiResponse } from '../utils/apiResponse';
import { logger } from '../config/logger';
import { env } from '../config/env';

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  _next: NextFunction
) {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let errors = err.errors;

  // Handle Mongoose duplicate key error (code 11000)
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    message = `A resource with that ${field} already exists`;
  }

  // Handle Mongoose CastError (e.g. invalid ObjectId)
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid format for resource identifier: ${err.value}`;
  }

  // Handle Mongoose ValidationError
  if (err.name === 'ValidationError' && !errors) {
    statusCode = 422;
    errors = Object.values(err.errors || {}).map((e: any) => ({
      field: e.path,
      message: e.message,
    }));
  }

  // Handle JSON parse error from express.json()
  if (err instanceof SyntaxError && 'body' in err) {
    statusCode = 400;
    message = 'Malformed JSON in request body';
  }

  // Log error (suppress stack trace for 4xx in production, log details for 5xx)
  if (statusCode >= 500) {
    logger.error(`[500 Server Error] ${req.method} ${req.originalUrl}: ${err.stack || err.message}`);
  } else {
    logger.warn(`[${statusCode} Client Error] ${req.method} ${req.originalUrl}: ${message}`);
  }

  if (statusCode === 500 && env.isProduction) {
    message = 'An unexpected server error occurred. Please contact support.';
  }

  return ApiResponse.error(res, message, statusCode, errors);
}

export function notFoundHandler(req: Request, res: Response) {
  return ApiResponse.error(
    res,
    `Route not found: ${req.method} ${req.originalUrl}`,
    404
  );
}
