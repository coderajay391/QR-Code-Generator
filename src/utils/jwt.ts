import jwt from 'jsonwebtoken';
import { env } from '../config/env';

export interface JwtPayload {
  userId: string;
  email: string;
  role?: string;
  [key: string]: any;
}

export class JwtUtil {
  static sign(payload: JwtPayload, expiresIn = env.JWT_EXPIRES_IN): string {
    return jwt.sign(payload, env.JWT_SECRET, {
      expiresIn: expiresIn as any,
    });
  }

  static verify(token: string): JwtPayload {
    return jwt.verify(token, env.JWT_SECRET) as JwtPayload;
  }
}
