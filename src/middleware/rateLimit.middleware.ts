import rateLimit from 'express-rate-limit';
import { env } from '../config/env';

/**
 * Public Anonymous QR Generation Rate Limiter (Strict)
 */
export const publicQrRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: env.isTest ? 1000 : env.RATE_LIMIT_MAX_PUBLIC, // 60 requests per 15 min by default
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many QR codes generated from this IP. Please wait 15 minutes or authenticate for higher limits.',
  },
});

/**
 * Authentication Rate Limiter (Brute-force protection for login/register)
 */
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: env.isTest ? 1000 : 20, // 20 attempts per 15 min
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many authentication attempts. Please try again after 15 minutes.',
  },
});

/**
 * General API Rate Limiter
 */
export const apiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: env.isTest ? 2000 : env.RATE_LIMIT_MAX_AUTH,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests to the API. Please slow down.',
  },
});
