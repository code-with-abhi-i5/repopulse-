// ============================================================
// RepoPulse — Background Task Worker Registration
// ============================================================

import { appQueue } from '../lib/queue.js';
import { syncRepository } from '../services/github.service.js';
import { runAntiCheatAudit } from '../services/anticheat.service.js';
import { evaluateAlertRules } from '../services/alert.service.js';
import { prisma } from '../lib/prisma.js';

export function initializeWorkers() {
  console.log('⚙️ [Worker Engine] Initializing background task workers...');

  // Worker: Sync Repository and run Anti-Cheat Audit
  appQueue.registerWorker('sync-repo', async (data) => {
    const { fullName, repositoryId, teamId, teamName, hackathonBatch, hackathonStartTime } = data;
    console.log(`🚀 [Worker: sync-repo] Starting job for ${fullName}`);

    try {
      const repo = await syncRepository(fullName, {
        teamId,
        teamName,
        hackathonBatch,
      });

      // Automatically run Anti-Cheat Audit if hackathon start time provided
      if (hackathonStartTime) {
        const startTime = new Date(hackathonStartTime);
        console.log(`🔍 [Worker: anti-cheat] Running audit for ${fullName} against ${startTime.toISOString()}`);
        await runAntiCheatAudit(repo.id, startTime);
      }
    } catch (err: any) {
      console.error(`❌ [Worker: sync-repo] Failed for ${fullName}:`, err.message);
    }
  });

  // Worker: Process Webhook events
  appQueue.registerWorker('github-webhook', async (data) => {
    const { event, payload } = data;
    console.log(`⚡ [Worker: webhook] Processing GitHub event: ${event}`);

    try {
      const repoFullName = payload?.repository?.full_name;
      if (repoFullName) {
        const repo = await prisma.repository.findUnique({ where: { fullName: repoFullName } });
        if (repo) {
          await evaluateAlertRules(repo.id, event, {
            title: `GitHub Webhook event: ${event}`,
          });
        }
      }
    } catch (err: any) {
      console.error(`❌ [Worker: webhook] Failed:`, err.message);
    }
  });

  console.log('✅ [Worker Engine] Background workers ready.');
}
