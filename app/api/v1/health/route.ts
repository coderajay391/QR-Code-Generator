import { NextResponse } from 'next/server';
import { dbState } from '@/src/config/database';
import { successResponse } from '@/lib/apiHelper';

export async function GET() {
  const memory = process.memoryUsage();
  return successResponse(
    {
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
    },
    'API is healthy'
  );
}
