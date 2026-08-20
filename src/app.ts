import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import { env } from './config/env';
import { requestLogger } from './middleware/logger.middleware';
import { errorHandler, notFoundHandler } from './middleware/error.middleware';
import { apiRateLimiter } from './middleware/rateLimit.middleware';

import authRoutes from './routes/auth.routes';
import qrRoutes from './routes/qr.routes';
import healthRoutes from './routes/health.routes';
import openApiSpec from './docs/openapi.json';

export function createApp(): Express {
  const app = express();

  // Security Headers
  app.use(
    helmet({
      contentSecurityPolicy: false, // Allow inline assets/previews
      crossOriginEmbedderPolicy: false,
    })
  );

  // CORS Configuration
  app.use(
    cors({
      origin: true, // Allow frontend & preview clients
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    })
  );

  // Body Parsing with safe size limit
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Request Logging
  app.use(requestLogger);

  // Global Rate Limiter
  app.use('/api', apiRateLimiter);

  // OpenAPI Specification endpoint
  app.get(['/api/docs/openapi.json', '/api/v1/docs/openapi.json', '/docs/openapi.json'], (_req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.json(openApiSpec);
  });

  // Versioned API Routes (v1)
  app.use('/api/v1/auth', authRoutes);
  app.use('/api/v1/qr', qrRoutes);
  app.use('/api/v1/health', healthRoutes);

  // Aliases for default /api paths
  app.use('/api/auth', authRoutes);
  app.use('/api/qr', qrRoutes);
  app.use('/api/health', healthRoutes);

  // 404 Route Handler
  app.use(notFoundHandler);

  // Global Centralized Error Handler
  app.use(errorHandler);

  return app;
}

export const app = createApp();
