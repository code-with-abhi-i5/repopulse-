// ============================================================
// RepoPulse — Production-Grade Singleton Redis Client
// ============================================================

import { Redis } from 'ioredis';
import { redisConfig } from '../../config/redis.config.js';

let redisInstance: Redis | null = null;
let isConnected = false;
let hasReportedError = false;

/**
 * Initializes and returns the Singleton Redis connection
 */
export function getRedisClient(): Redis | null {
  if (redisInstance) {
    return redisInstance;
  }

  // Check if REDIS_URL is explicitly set or valid
  const url = redisConfig.url;
  if (!url) {
    console.log('ℹ️ [Redis] REDIS_URL not configured. Operating in resilient fallback mode.');
    return null;
  }

  try {
    redisInstance = new Redis(url, {
      keyPrefix: redisConfig.keyPrefix,
      connectTimeout: redisConfig.connectTimeout,
      maxRetriesPerRequest: redisConfig.maxRetriesPerRequest,
      retryStrategy: redisConfig.retryStrategy,
      enableOfflineQueue: false, // Prevents commands from piling up indefinitely when Redis is offline
      lazyConnect: true, // Don't block application startup
    });

    // Event listeners
    redisInstance.on('connect', () => {
      isConnected = true;
      hasReportedError = false;
      console.log('✅ [Redis] Connection established successfully.');
    });

    redisInstance.on('ready', () => {
      isConnected = true;
      console.log('⚡ [Redis] Ready to serve cached queries with sub-millisecond latency.');
    });

    redisInstance.on('error', (err: any) => {
      isConnected = false;
      if (!hasReportedError) {
        hasReportedError = true;
        console.warn(`⚠️ [Redis Warning] Could not connect to Redis server (${err.code || err.message}).`);
        console.warn('   💡 Operating in resilient database fallback mode. No API requests will fail.');
      }
    });

    redisInstance.on('close', () => {
      isConnected = false;
    });

    redisInstance.on('reconnecting', (ms: number) => {
      if (!hasReportedError) {
        console.log(`🔄 [Redis] Attempting reconnect in ${ms}ms...`);
      }
    });

    // Attempt non-blocking connection
    redisInstance.connect().catch((err: any) => {
      isConnected = false;
      if (!hasReportedError) {
        hasReportedError = true;
        console.warn(`⚠️ [Redis] Background connect notice: ${err.message}. Fallback mode active.`);
      }
    });

    return redisInstance;
  } catch (err: any) {
    console.warn(`⚠️ [Redis] Initialization skipped: ${err.message}`);
    isConnected = false;
    return null;
  }
}

/**
 * Checks if Redis client is currently connected and healthy
 */
export function isRedisConnected(): boolean {
  return isConnected && redisInstance !== null && redisInstance.status === 'ready';
}

/**
 * Graceful shutdown for Redis connection
 */
export async function closeRedisConnection(): Promise<void> {
  if (redisInstance) {
    try {
      console.log('🛑 [Redis] Closing connection gracefully...');
      await redisInstance.quit();
      console.log('✅ [Redis] Connection closed.');
    } catch {
      redisInstance.disconnect();
    } finally {
      redisInstance = null;
      isConnected = false;
    }
  }
}
