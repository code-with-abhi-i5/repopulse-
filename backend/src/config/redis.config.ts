// ============================================================
// RepoPulse — Redis Configuration
// ============================================================

import { ENV } from './env.js';

export interface RedisConfig {
  url: string;
  host?: string;
  port?: number;
  password?: string;
  db?: number;
  keyPrefix: string;
  connectTimeout: number;
  maxRetriesPerRequest: number;
  retryStrategy: (times: number) => number | void;
}

export const redisConfig: RedisConfig = {
  url: ENV.REDIS_URL || 'redis://localhost:6379',
  keyPrefix: 'repopulse:v1:',
  connectTimeout: 3000, // 3s timeout to protect backend from hanging
  maxRetriesPerRequest: 1, // Fail fast so caller falls back to DB immediately
  retryStrategy: (times: number) => {
    // Retry up to 5 times with exponential backoff (max 3 seconds)
    if (times > 5) {
      return undefined; // Stop retrying
    }
    return Math.min(times * 500, 3000);
  },
};
