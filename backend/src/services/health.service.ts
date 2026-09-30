// ============================================================
// RepoPulse — 6-Pillar Health Score Calculator
// ============================================================

import { prisma } from '../lib/prisma.js';
import { broadcastHealthUpdate } from '../lib/socket.js';

export interface HealthBreakdown {
  total: number;
  activity: number;        // Weight: 25%
  responsiveness: number;  // Weight: 20%
  ciHealth: number;        // Weight: 15%
  busFactor: number;       // Weight: 15%
  community: number;       // Weight: 10%
  security: number;        // Weight: 15%
  tips: string[];
}

export async function calculateHealthScore(repositoryId: string): Promise<HealthBreakdown> {
  const repo = await prisma.repository.findUnique({
    where: { id: repositoryId },
    include: {
      commits: { take: 100, orderBy: { timestamp: 'desc' } },
      pullRequests: { take: 50, orderBy: { createdAt: 'desc' } },
      issues: { take: 50, orderBy: { createdAt: 'desc' } },
      workflows: { take: 20, orderBy: { createdAt: 'desc' } },
      securityAlerts: true,
    },
  });

  if (!repo) {
    throw new Error(`Repository not found: ${repositoryId}`);
  }

  const tips: string[] = [];

  // 1. Activity (25%): commits in last 7 days + frequency
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const recentCommits = repo.commits.filter((c) => new Date(c.timestamp) >= sevenDaysAgo);
  
  let activity = Math.min(100, Math.round((recentCommits.length / 12) * 100));
  if (recentCommits.length < 3) {
    tips.push('Commit velocity is low in the last 7 days. Push code incrementally.');
  }

  // 2. Responsiveness (20%): PR review latency and issue SLA
  let responsiveness = 85;
  const mergedPRs = repo.pullRequests.filter((pr) => pr.mergeTimeHours != null);
  if (mergedPRs.length > 0) {
    const avgMergeTime = mergedPRs.reduce((acc, p) => acc + (p.mergeTimeHours || 0), 0) / mergedPRs.length;
    if (avgMergeTime > 48) {
      responsiveness -= 25;
      tips.push('PR review latency is high (>48h). Accelerate peer code reviews.');
    } else if (avgMergeTime > 24) {
      responsiveness -= 10;
    }
  }

  // 3. CI Health (15%): Workflow success rate
  let ciHealth = 90;
  if (repo.workflows.length > 0) {
    const passingCount = repo.workflows.filter((w) => w.status === 'PASSING').length;
    ciHealth = Math.round((passingCount / repo.workflows.length) * 100);
    if (ciHealth < 70) {
      tips.push('CI build pass rate is below 70%. Investigate failing workflow steps.');
    }
  }

  // 4. Bus Factor (15%): Contributor distribution
  const authorCommitCounts: Record<string, number> = {};
  repo.commits.forEach((c) => {
    authorCommitCounts[c.authorLogin] = (authorCommitCounts[c.authorLogin] || 0) + 1;
  });
  const authors = Object.keys(authorCommitCounts);
  let busFactor = 50;
  if (authors.length >= 4) {
    busFactor = 95;
  } else if (authors.length >= 2) {
    busFactor = 75;
  } else {
    busFactor = 35;
    tips.push('High bus factor risk: A single contributor authors over 80% of commits.');
  }

  // 5. Community (10%): Stars & forks
  const community = Math.min(100, Math.round(((repo.stars * 2 + repo.forks * 5) / 40) * 100));

  // 6. Security (15%): Dependabot & Vulnerabilities
  let security = 100;
  const criticalVulns = repo.securityAlerts.filter((s) => s.severity === 'CRITICAL').length;
  const highVulns = repo.securityAlerts.filter((s) => s.severity === 'HIGH').length;
  security = Math.max(0, 100 - criticalVulns * 30 - highVulns * 15);
  if (criticalVulns > 0) {
    tips.push(`Critical security vulnerabilities detected (${criticalVulns}). Update vulnerable dependencies.`);
  }

  // Weighted Total
  const total = Math.round(
    activity * 0.25 +
    responsiveness * 0.20 +
    ciHealth * 0.15 +
    busFactor * 0.15 +
    community * 0.10 +
    security * 0.15
  );

  // Update repository score
  await prisma.repository.update({
    where: { id: repositoryId },
    data: { healthScore: total },
  });

  const breakdown: HealthBreakdown = {
    total,
    activity,
    responsiveness,
    ciHealth,
    busFactor,
    community,
    security,
    tips: tips.slice(0, 4),
  };

  // Broadcast live update to frontends via WebSocket
  broadcastHealthUpdate(repositoryId, total, breakdown);

  return breakdown;
}
