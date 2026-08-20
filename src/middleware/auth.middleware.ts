import { Request, Response, NextFunction } from 'express';
import { JwtUtil } from '../utils/jwt';
import { UnauthorizedError } from '../utils/errors';

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role?: string;
  };
}

export function authMiddleware(
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('Authentication token is missing. Please provide a Bearer token.');
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      throw new UnauthorizedError('Authentication token is invalid.');
    }

    const payload = JwtUtil.verify(token);
    req.user = {
      userId: payload.userId,
      email: payload.email,
      role: payload.role,
    };

    next();
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      return next(new UnauthorizedError('Token has expired. Please log in again.'));
    }
    if (error.name === 'JsonWebTokenError') {
      return next(new UnauthorizedError('Invalid authentication token.'));
    }
    next(error);
  }
}

export function optionalAuthMiddleware(
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
) {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      if (token) {
        const payload = JwtUtil.verify(token);
        req.user = {
          userId: payload.userId,
          email: payload.email,
          role: payload.role,
        };
      }
    }
    next();
  } catch {
    // Optional auth simply proceeds without user attached
    next();
  }
}
