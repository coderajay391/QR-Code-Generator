import mongoose from 'mongoose';
import { env } from './env';
import { logger } from './logger';

interface DatabaseConnectionState {
  isConnected: boolean;
  mode: 'mongodb' | 'fallback_memory';
}

export const dbState: DatabaseConnectionState = {
  isConnected: false,
  mode: 'fallback_memory',
};

export async function connectDB(): Promise<void> {
  if (dbState.isConnected) {
    return;
  }

  // If testing or explicitly no MongoDB URI provided, use memory adapter
  if (env.isTest || !env.MONGODB_URI) {
    dbState.isConnected = true;
    dbState.mode = 'fallback_memory';
    logger.info('Database running in in-memory memory mode');
    return;
  }

  try {
    const opts = {
      serverSelectionTimeoutMS: 2000,
      autoIndex: true,
    };
    
    mongoose.connection.on('connected', () => {
      dbState.isConnected = true;
      dbState.mode = 'mongodb';
      logger.info(`MongoDB connected to: ${env.MONGODB_URI.split('@').pop() || 'localhost'}`);
    });

    mongoose.connection.on('error', (err) => {
      logger.warn(`MongoDB connection error: ${err.message}. Using resilient memory storage adapter.`);
      dbState.isConnected = true;
      dbState.mode = 'fallback_memory';
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected');
      dbState.isConnected = false;
    });

    await mongoose.connect(env.MONGODB_URI, opts);
  } catch (error: any) {
    logger.warn(`Failed to connect to MongoDB (${error.message}). Falling back to high-fidelity memory store for instant preview/local execution.`);
    dbState.isConnected = true;
    dbState.mode = 'fallback_memory';
  }
}

export async function disconnectDB(): Promise<void> {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  dbState.isConnected = false;
}
