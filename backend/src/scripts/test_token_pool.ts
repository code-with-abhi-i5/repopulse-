import { tokenPool } from '../lib/token-pool.js';
import axios from 'axios';

async function checkToken(token: string, index: number) {
  try {
    const res = await axios.get('https://api.github.com/rate_limit', {
      headers: {
        Authorization: `Bearer ${token}`,
        'User-Agent': 'RepoPulse-App',
      },
    });
    const core = res.data.resources.core;
    console.log(`✅ [Token #${index + 1}] Valid! Rate Limit: ${core.remaining} / ${core.limit} (Resets at: ${new Date(core.reset * 1000).toLocaleTimeString()})`);
  } catch (err: any) {
    console.error(`❌ [Token #${index + 1}] Error:`, err?.response?.data?.message || err.message);
  }
}

async function main() {
  tokenPool.refreshTokens();
  console.log(`\n🔑 Testing GitHub Token Pool (Size: ${tokenPool.getPoolSize()} tokens):`);
  
  const tokens: string[] = [];
  for (let i = 0; i < tokenPool.getPoolSize(); i++) {
    const t = tokenPool.getNextToken();
    if (t) tokens.push(t);
  }

  for (let i = 0; i < tokens.length; i++) {
    await checkToken(tokens[i], i);
  }

  console.log(`\n🎉 Total Capacity: ~${tokenPool.getPoolSize() * 5000} requests/hour across the pool!\n`);
}

main();
