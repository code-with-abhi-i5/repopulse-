// ============================================================
// RepoPulse — Upstash Redis Reusable Client (REST API)
// ============================================================

import { Redis } from '@upstash/redis';
import { ENV } from '../config/env.js';

const restUrl = process.env.UPSTASH_REDIS_REST_URL || ENV.UPSTASH_REDIS_REST_URL || '';
const restToken = process.env.UPSTASH_REDIS_REST_TOKEN || ENV.UPSTASH_REDIS_REST_TOKEN || '';

export const isUpstashConfigured = Boolean(
  restUrl &&
  restToken &&
  restUrl.trim().length > 0 &&
  restToken.trim().length > 0 &&
  !restUrl.includes('your_upstash')
);

// Singleton Upstash Redis instance
export const redis: Redis | null = isUpstashConfigured
  ? new Redis({
      url: restUrl.trim(),
      token: restToken.trim(),
    })
  : null;

export default redis;
