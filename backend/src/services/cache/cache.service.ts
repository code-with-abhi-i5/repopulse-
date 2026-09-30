// ============================================================
// RepoPulse — Application Cache Service
// ============================================================

import { redisService } from '../../infrastructure/redis/redis.service.js';
import { cacheKeys, CACHE_TTL } from '../../infrastructure/redis/redis.keys.js';
import { checkRedisHealth, metricsTracker } from '../../infrastructure/redis/redis.health.js';

export const cacheService = redisService;
export { cacheKeys, CACHE_TTL, checkRedisHealth, metricsTracker };
