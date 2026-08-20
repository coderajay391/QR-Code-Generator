import { Request, Response } from 'express';
import { dbState } from '../config/database';
import { ApiResponse } from '../utils/apiResponse';

export class HealthController {
  static getHealth(_req: Request, res: Response) {
    const memory = process.memoryUsage();
    const payload = {
      status: 'healthy',
      uptime: `${Math.floor(process.uptime())}s`,
      database: {
        connected: dbState.isConnected,
        engine: dbState.mode === 'mongodb' ? 'MongoDB / Mongoose' : 'In-Memory Resilient Store',
      },
      system: {
        nodeVersion: process.version,
        platform: process.platform,
        memoryUsageMb: Math.round(memory.heapUsed / 1024 / 1024),
      },
      timestamp: new Date().toISOString(),
    };

    return ApiResponse.success(res, payload, 'API is healthy');
  }
}
