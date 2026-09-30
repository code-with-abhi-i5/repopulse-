// ============================================================
// RepoPulse — Production-Grade Upstash Redis Service Layer
// ============================================================

import { redis, isUpstashConfigured } from '../../lib/redis.js';
import { getRedisClient, isRedisConnected } from './redis.client.js';
import { metricsTracker } from './redis.health.js';
import { cacheKeys, CACHE_TTL } from './redis.keys.js';

export class RedisService {
  // In-flight request coalescing to protect against cache stampedes
  private inFlightRequests: Map<string, Promise<any>> = new Map();

  // Resilient in-memory fallback cache with TTL for zero-downtime
  private fallbackCache: Map<string, { value: string; expiresAt: number }> = new Map();

  /**
   * Safely serialize data into JSON string (handles BigInt from Prisma models, Dates, etc.)
   */
  private serialize(value: any): string {
    return JSON.stringify(value, (_, v) => (typeof v === 'bigint' ? Number(v) : v));
  }

  /**
   * Safely deserialize JSON string back to original type
   */
  private deserialize<T>(data: any): T {
    if (typeof data !== 'string') {
      return data as T;
    }
    return JSON.parse(data) as T;
  }

  /**
   * Fast timeout wrapper for network requests to prevent hanging
   */
  private async withTimeout<T>(promise: Promise<T>, ms: number = 3000): Promise<T> {
    let timer: any;
    const timeoutPromise = new Promise<never>((_, reject) => {
      timer = setTimeout(() => reject(new Error(`Timeout after ${ms}ms`)), ms);
    });
    try {
      return await Promise.race([promise, timeoutPromise]);
    } finally {
      clearTimeout(timer);
    }
  }

  /**
   * GET cache key
   */
  public async get<T>(key: string): Promise<T | null> {
    // 1. Try Upstash Redis REST (with resilient 3s timeout)
    if (redis && isUpstashConfigured) {
      try {
        const raw = await this.withTimeout(redis.get(key), 3000);
        if (raw !== null && raw !== undefined) {
          metricsTracker.recordHit();
          console.log(`⚡ [Redis HIT] ${key}`);
          return this.deserialize<T>(raw);
        }
        metricsTracker.recordMiss();
        console.log(`💨 [Redis MISS] ${key}`);
        return null;
      } catch (err: any) {
        metricsTracker.recordError();
        console.warn(`⚠️ [Redis ERROR] GET ${key}:`, err?.message || err);
        // Seamlessly continue to fallback layer
      }
    }

    // 2. Try Local ioredis (if running)
    const localClient = getRedisClient();
    if (localClient && isRedisConnected()) {
      try {
        const raw = await localClient.get(key);
        if (raw !== null) {
          metricsTracker.recordHit();
          console.log(`⚡ [Redis HIT] ${key}`);
          return this.deserialize<T>(raw);
        }
        metricsTracker.recordMiss();
        console.log(`💨 [Redis MISS] ${key}`);
        return null;
      } catch (err: any) {
        metricsTracker.recordError();
        console.warn(`⚠️ [Redis ERROR] GET ${key}:`, err?.message || err);
      }
    }

    // 3. Resilient In-Memory Fallback
    const local = this.fallbackCache.get(key);
    if (local) {
      if (Date.now() < local.expiresAt) {
        metricsTracker.recordHit();
        console.log(`⚡ [Redis HIT (Memory Fallback)] ${key}`);
        return this.deserialize<T>(local.value);
      }
      this.fallbackCache.delete(key);
    }

    metricsTracker.recordMiss();
    console.log(`💨 [Redis MISS] ${key}`);
    return null;
  }

  /**
   * SET cache key with TTL (in seconds)
   */
  public async set(key: string, value: any, ttlSeconds: number = CACHE_TTL.REPOS_LIST): Promise<boolean> {
    if (value === undefined || value === null) {
      return false;
    }

    const payload = this.serialize(value);
    metricsTracker.recordSet();

    // 1. Write to Upstash Redis REST
    if (redis && isUpstashConfigured) {
      try {
        if (ttlSeconds > 0) {
          await this.withTimeout(redis.set(key, payload, { ex: ttlSeconds }), 3000);
        } else {
          await this.withTimeout(redis.set(key, payload), 3000);
        }
        console.log(`💾 [Redis SET] ${key} (TTL: ${ttlSeconds}s)`);
      } catch (err: any) {
        metricsTracker.recordError();
        console.warn(`⚠️ [Redis ERROR] SET ${key}:`, err?.message || err);
      }
    }

    // 2. Write to Local ioredis if active
    const localClient = getRedisClient();
    if (localClient && isRedisConnected()) {
      try {
        if (ttlSeconds > 0) {
          await localClient.set(key, payload, 'EX', ttlSeconds);
        } else {
          await localClient.set(key, payload);
        }
      } catch (err: any) {
        metricsTracker.recordError();
      }
    }

    // 3. Mirror into Resilient In-Memory Cache
    this.fallbackCache.set(key, {
      value: payload,
      expiresAt: Date.now() + ttlSeconds * 1000,
    });

    // Cleanup memory if large
    if (this.fallbackCache.size > 2000) {
      const now = Date.now();
      for (const [k, v] of this.fallbackCache.entries()) {
        if (now > v.expiresAt) this.fallbackCache.delete(k);
      }
    }

    return true;
  }

  /**
   * DELETE single cache key
   */
  public async delete(key: string): Promise<boolean> {
    metricsTracker.recordDelete(1);
    this.fallbackCache.delete(key);

    if (redis && isUpstashConfigured) {
      try {
        await this.withTimeout(redis.del(key), 3000);
        console.log(`🗑️ [Redis INVALIDATED] ${key}`);
      } catch (err: any) {
        metricsTracker.recordError();
        console.warn(`⚠️ [Redis ERROR] DEL ${key}:`, err?.message || err);
      }
    }

    const localClient = getRedisClient();
    if (localClient && isRedisConnected()) {
      try {
        await localClient.del(key);
      } catch {
        metricsTracker.recordError();
      }
    }

    return true;
  }

  /**
   * DELETE multiple cache keys
   */
  public async deleteMany(keys: string[]): Promise<boolean> {
    if (!keys || keys.length === 0) return true;

    metricsTracker.recordDelete(keys.length);
    for (const k of keys) {
      this.fallbackCache.delete(k);
    }

    if (redis && isUpstashConfigured) {
      try {
        await this.withTimeout(redis.del(...keys), 3000);
        console.log(`🗑️ [Redis INVALIDATED] ${keys.length} keys`);
      } catch (err: any) {
        metricsTracker.recordError();
        console.warn(`⚠️ [Redis ERROR] DEL many:`, err?.message || err);
      }
    }

    const localClient = getRedisClient();
    if (localClient && isRedisConnected()) {
      try {
        await localClient.del(...keys);
      } catch {
        metricsTracker.recordError();
      }
    }

    return true;
  }

  /**
   * CHECK if key exists
   */
  public async exists(key: string): Promise<boolean> {
    if (redis && isUpstashConfigured) {
      try {
        const count = await redis.exists(key);
        return count > 0;
      } catch {
        metricsTracker.recordError();
      }
    }

    const localClient = getRedisClient();
    if (localClient && isRedisConnected()) {
      try {
        const count = await localClient.exists(key);
        return count > 0;
      } catch {
        metricsTracker.recordError();
      }
    }

    const local = this.fallbackCache.get(key);
    return !!local && Date.now() < local.expiresAt;
  }

  /**
   * EXPIRE a key after ttl seconds
   */
  public async expire(key: string, ttlSeconds: number): Promise<boolean> {
    if (redis && isUpstashConfigured) {
      try {
        const result = await redis.expire(key, ttlSeconds);
        return result === 1;
      } catch {
        metricsTracker.recordError();
      }
    }

    const localClient = getRedisClient();
    if (localClient && isRedisConnected()) {
      try {
        const result = await localClient.expire(key, ttlSeconds);
        return result === 1;
      } catch {
        metricsTracker.recordError();
      }
    }

    const local = this.fallbackCache.get(key);
    if (local) {
      local.expiresAt = Date.now() + ttlSeconds * 1000;
      return true;
    }
    return false;
  }

  /**
   * GET remaining TTL
   */
  public async ttl(key: string): Promise<number> {
    if (redis && isUpstashConfigured) {
      try {
        return await redis.ttl(key);
      } catch {
        metricsTracker.recordError();
      }
    }

    const localClient = getRedisClient();
    if (localClient && isRedisConnected()) {
      try {
        return await localClient.ttl(key);
      } catch {
        metricsTracker.recordError();
      }
    }

    const local = this.fallbackCache.get(key);
    if (local) {
      return Math.max(0, Math.floor((local.expiresAt - Date.now()) / 1000));
    }
    return -2;
  }

  /**
   * CLEAR keys matching pattern
   */
  public async clearByPattern(pattern: string): Promise<number> {
    let deletedCount = 0;

    // 1. Clear matching keys from memory fallback
    const escaped = pattern.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*');
    const regexPattern = new RegExp(`^${escaped}$`);
    for (const key of this.fallbackCache.keys()) {
      if (regexPattern.test(key) || key.endsWith(pattern.replace(/\*/g, ''))) {
        this.fallbackCache.delete(key);
        deletedCount++;
      }
    }

    // 2. Clear from Upstash Redis REST
    if (redis && isUpstashConfigured) {
      try {
        const keys = await redis.keys(pattern);
        if (keys && keys.length > 0) {
          await redis.del(...keys);
          deletedCount += keys.length;
          console.log(`🗑️ [Redis INVALIDATED] Pattern: ${pattern} (${keys.length} keys)`);
        }
      } catch (err: any) {
        metricsTracker.recordError();
        console.warn(`⚠️ [Redis ERROR] clearByPattern ${pattern}:`, err?.message || err);
      }
    }

    // 3. Clear from local ioredis
    const localClient = getRedisClient();
    if (localClient && isRedisConnected()) {
      try {
        let cursor = '0';
        do {
          const [nextCursor, keys] = await localClient.scan(cursor, 'MATCH', `*${pattern}`, 'COUNT', 100);
          cursor = nextCursor;
          if (keys && keys.length > 0) {
            await localClient.del(...keys);
            deletedCount += keys.length;
          }
        } while (cursor !== '0');
      } catch {
        metricsTracker.recordError();
      }
    }

    metricsTracker.recordDelete(deletedCount);
    return deletedCount;
  }

  /**
   * Cache-Aside Wrapper with Stampede Protection (Request Coalescing)
   * If 500 requests hit simultaneously for a cold cache, only ONE database query is fired.
   */
  public async getOrSet<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttlSeconds: number = CACHE_TTL.REPOS_LIST
  ): Promise<T> {
    // 1. Check cache first
    const cached = await this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    // 2. Check if this exact query is already in-flight (Single-Flight Stampede Guard)
    const inFlight = this.inFlightRequests.get(key);
    if (inFlight) {
      return inFlight as Promise<T>;
    }

    // 3. Initiate fetcher and coalesce concurrent callers
    const fetchPromise = (async () => {
      try {
        const freshData = await fetcher();
        if (freshData !== undefined && freshData !== null) {
          // Asynchronously store in Redis
          await this.set(key, freshData, ttlSeconds).catch(() => {});
        }
        return freshData;
      } finally {
        this.inFlightRequests.delete(key);
      }
    })();

    this.inFlightRequests.set(key, fetchPromise);
    return fetchPromise;
  }

  // -------------------------------------------------------------
  // Targeted Invalidation Helpers
  // -------------------------------------------------------------

  /**
   * Invalidate a single repository and all repository listing query variants
   */
  public async invalidateRepository(repoId: string, fullName?: string): Promise<void> {
    const keysToDelete = cacheKeys.patterns.singleRepo(repoId, fullName);
    await this.deleteMany(keysToDelete);
    await this.clearByPattern(cacheKeys.patterns.allRepoLists);
    await this.clearByPattern(cacheKeys.patterns.allAnalytics);
    await this.clearByPattern(cacheKeys.patterns.allReports);
  }

  /**
   * Invalidate all repositories cache
   */
  public async invalidateAllRepositories(): Promise<void> {
    await this.clearByPattern(cacheKeys.patterns.allRepos);
    await this.clearByPattern(cacheKeys.patterns.allAnalytics);
    await this.clearByPattern(cacheKeys.patterns.allReports);
  }

  /**
   * Invalidate contributors cache
   */
  public async invalidateContributors(login?: string): Promise<void> {
    if (login) {
      await this.delete(cacheKeys.contributorDetail(login));
    }
    await this.clearByPattern(cacheKeys.patterns.allContributors);
    await this.clearByPattern(cacheKeys.patterns.allAnalytics);
    await this.clearByPattern(cacheKeys.patterns.allReports);
  }

  /**
   * Invalidate activities cache
   */
  public async invalidateActivities(): Promise<void> {
    await this.clearByPattern(cacheKeys.patterns.allActivities);
    await this.clearByPattern(cacheKeys.patterns.allAnalytics);
  }

  /**
   * Invalidate analytics cache
   */
  public async invalidateAnalytics(): Promise<void> {
    await this.clearByPattern(cacheKeys.patterns.allAnalytics);
  }

  /**
   * Invalidate reports cache
   */
  public async invalidateReports(): Promise<void> {
    await this.clearByPattern(cacheKeys.patterns.allReports);
  }
}

export const redisService = new RedisService();
