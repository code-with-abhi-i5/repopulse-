// ============================================================
// RepoPulse — Redis Health & Observability Metrics
// ============================================================

import { redis, isUpstashConfigured } from '../../lib/redis.js';
import { getRedisClient, isRedisConnected } from './redis.client.js';

export interface CacheMetrics {
  hits: number;
  misses: number;
  sets: number;
  deletes: number;
  errors: number;
  totalRequests: number;
  hitRate: string;
}

class CacheMetricsTracker {
  private hits: number = 0;
  private misses: number = 0;
  private sets: number = 0;
  private deletes: number = 0;
  private errors: number = 0;

  public recordHit() {
    this.hits++;
  }

  public recordMiss() {
    this.misses++;
  }

  public recordSet() {
    this.sets++;
  }

  public recordDelete(count: number = 1) {
    this.deletes += count;
  }

  public recordError() {
    this.errors++;
  }

  public getMetrics(): CacheMetrics {
    const total = this.hits + this.misses;
    const rate = total > 0 ? ((this.hits / total) * 100).toFixed(1) + '%' : '0.0%';

    return {
      hits: this.hits,
      misses: this.misses,
      sets: this.sets,
      deletes: this.deletes,
      errors: this.errors,
      totalRequests: total,
      hitRate: rate,
    };
  }

  public reset() {
    this.hits = 0;
    this.misses = 0;
    this.sets = 0;
    this.deletes = 0;
    this.errors = 0;
  }
}

export const metricsTracker = new CacheMetricsTracker();

async function withTimeout<T>(promise: Promise<T>, ms: number = 1000): Promise<T> {
  let timer: any;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error('Timeout')), ms);
  });
  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Checks Redis health (Upstash REST -> local ioredis -> in-memory fallback)
 */
export async function checkRedisHealth(): Promise<{
  provider: string;
  status: 'connected' | 'disconnected' | 'fallback_mode';
  latencyMs?: number;
  metrics: CacheMetrics;
}> {
  // 1. Check Upstash Redis (Serverless REST)
  if (redis && isUpstashConfigured) {
    const start = Date.now();
    try {
      const pong = await withTimeout(redis.ping(), 1000);
      const latencyMs = Date.now() - start;
      return {
        provider: 'Upstash Redis (Serverless REST)',
        status: pong ? 'connected' : 'fallback_mode',
        latencyMs,
        metrics: metricsTracker.getMetrics(),
      };
    } catch {
      return {
        provider: 'Upstash Redis (Connection Notice - Operating in Resilient Fallback Mode)',
        status: 'fallback_mode',
        metrics: metricsTracker.getMetrics(),
      };
    }
  }

  // 2. Check Local TCP ioredis
  const client = getRedisClient();
  const connected = isRedisConnected();

  if (client && connected) {
    const start = Date.now();
    try {
      const pong = await client.ping();
      const latencyMs = Date.now() - start;
      return {
        provider: 'Local Redis (TCP ioredis)',
        status: pong === 'PONG' ? 'connected' : 'disconnected',
        latencyMs,
        metrics: metricsTracker.getMetrics(),
      };
    } catch {
      // Fall through
    }
  }

  // 3. Resilient In-Memory Fallback
  return {
    provider: 'RepoPulse In-Memory Cache (Resilient Fallback Mode)',
    status: 'fallback_mode',
    metrics: metricsTracker.getMetrics(),
  };
}
