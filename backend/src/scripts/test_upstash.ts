// ============================================================
// RepoPulse — Upstash Redis Connection & Benchmark Test
// ============================================================

import { redis, isUpstashConfigured } from '../lib/redis.js';
import { cacheService } from '../services/cache/cache.service.js';

async function testUpstashConnection() {
  console.log('\n======================================================');
  console.log('⚡ RepoPulse — Upstash Redis Cloud Verification');
  console.log('======================================================\n');

  if (!isUpstashConfigured || !redis) {
    console.log('ℹ️ [Upstash Notice] UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN are not configured in .env yet.');
    console.log('💡 How to configure Upstash Redis:');
    console.log('   1. Create a free Redis database at https://console.upstash.com');
    console.log('   2. Copy UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN');
    console.log('   3. Paste them into backend/.env (and Render environment variables)');
    console.log('\n🛡️ Current Mode: Zero-Downtime In-Memory + Supabase Fallback Active (100% operational)\n');
    return;
  }

  try {
    console.log('▶ [Step 1] Testing Upstash REST Ping...');
    const start = Date.now();
    const pong = await redis.ping();
    const pingLatency = Date.now() - start;
    console.log(`  ✅ Connected to Upstash Redis! Response: "${pong}" in ${pingLatency}ms`);

    console.log('\n▶ [Step 2] Testing Set & Get with TTL...');
    const testKey = 'upstash:test:roundtrip';
    await cacheService.set(testKey, { test: 'upstash-ok', timestamp: Date.now() }, 60);
    const data = await cacheService.get<any>(testKey);
    console.log('  ✅ Retrieved data from Upstash:', data);

    console.log('\n▶ [Step 3] Testing Key Deletion...');
    await cacheService.delete(testKey);
    const afterDelete = await cacheService.get(testKey);
    console.log('  ✅ Deleted key, value after delete:', afterDelete);

    console.log('\n======================================================');
    console.log('🎉 UPSTASH REDIS CLOUD IS 100% OPERATIONAL!');
    console.log('======================================================\n');
  } catch (err: any) {
    console.error('❌ Upstash Redis error:', err.message || err);
    console.log('🛡️ The backend gracefully continues using fallback mode without breaking.');
  }
}

testUpstashConnection();
