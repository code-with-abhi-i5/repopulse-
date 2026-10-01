// ============================================================
// RepoPulse — Automated Background Poller Cron (Zero-Webhook Live Updates)
// ============================================================

import { prisma } from '../lib/prisma.js';
import { getOctokitClient } from '../lib/octokit.js';
import { calculateHealthScore } from '../services/health.service.js';
import { broadcastActivityEvent } from '../lib/socket.js';
import { cacheService } from '../services/cache/cache.service.js';
import { syncRepository } from '../services/github.service.js';

let pollerInterval: NodeJS.Timeout | null = null;
let isPolling = false;

export function startBackgroundPoller(intervalSeconds: number = 45) {
  if (pollerInterval) {
    clearInterval(pollerInterval);
  }

  console.log(`⏱️ [Poller Cron] Starting automated GitHub poller (every ${intervalSeconds}s)...`);

  pollerInterval = setInterval(async () => {
    if (isPolling) return;
    isPolling = true;

    try {
      await pollAllRepositories();
    } catch (err: any) {
      console.warn(`⚠️ [Poller Cron] Notice during polling cycle: ${err.message?.split('\n')[0] || err.message}`);
    } finally {
      isPolling = false;
    }
  }, intervalSeconds * 1000);
}

export function stopBackgroundPoller() {
  if (pollerInterval) {
    clearInterval(pollerInterval);
    pollerInterval = null;
    console.log('🛑 [Poller Cron] Background poller stopped.');
  }
}

async function pollAllRepositories() {
  let repos;
  try {
    repos = await prisma.repository.findMany({
      take: 50,
      orderBy: { updatedAt: 'asc' },
    });
  } catch (err: any) {
    // If Supabase pooler severed the connection due to idle timeout (Windows error 10054 / ConnectionReset),
    // disconnect Prisma engine and cleanly retry with a fresh connection.
    const isConnReset = err.message?.includes('10054') || 
                        err.message?.includes('ConnectionReset') || 
                        err.message?.includes('forcibly closed') ||
                        err.message?.includes('Can\'t reach database server');

    if (isConnReset) {
      console.warn('🔄 [Poller] Re-establishing database connection with Supabase pooler...');
      await prisma.$disconnect().catch(() => {});
      // Wait 1.5 seconds for socket to clear, then retry
      await new Promise((r) => setTimeout(r, 1500));
      repos = await prisma.repository.findMany({
        take: 50,
        orderBy: { updatedAt: 'asc' },
      });
    } else {
      throw err;
    }
  }

  if (!repos || repos.length === 0) return;

  const octokit = getOctokitClient();

  for (const repo of repos) {
    try {
      const [owner, name] = repo.fullName.split('/');
      if (!owner || !name) continue;

      // Check repo metadata to see if pushedAt changed
      const { data: ghRepo } = await octokit.rest.repos.get({ owner, repo: name });
      const remotePushedAt = new Date(ghRepo.pushed_at || ghRepo.updated_at);
      const localPushedAt = new Date(repo.pushedAt);

      if (remotePushedAt.getTime() > localPushedAt.getTime()) {
        console.log(`⚡ [Poller] New push activity detected in ${repo.fullName}! Triggering full sync...`);
        try {
          await syncRepository(repo.fullName, {
            teamName: repo.teamName || undefined,
            hackathonBatch: repo.hackathonBatch || undefined,
          });
        } catch (syncErr: any) {
          console.warn(`⚠️ [Poller] Sync failed for ${repo.fullName}:`, syncErr.message);
        }
      }
    } catch (err: any) {
      // Ignore individual rate limit / network hiccups for a single repo
      continue;
    }
  }
}
