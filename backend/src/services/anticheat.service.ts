// ============================================================
// RepoPulse — Hackathon Anti-Cheat & Freshness Audit Engine
// ============================================================

import { prisma } from '../lib/prisma.js';
import { broadcastAntiCheatStatus } from '../lib/socket.js';
import { AntiCheatStatus } from '@prisma/client';

export interface AuditResult {
  repositoryId: string;
  status: AntiCheatStatus;
  reasons: string[];
  flaggedCommits: string[];
  aiSuspicionScore: number;
}

export async function runAntiCheatAudit(
  repositoryId: string,
  hackathonStartTime: Date
): Promise<AuditResult> {
  const repo = await prisma.repository.findUnique({
    where: { id: repositoryId },
    include: {
      commits: { orderBy: { timestamp: 'asc' } },
    },
  });

  if (!repo) {
    throw new Error(`Repository not found: ${repositoryId}`);
  }

  const reasons: string[] = [];
  const flaggedCommits: string[] = [];
  let status: AntiCheatStatus = AntiCheatStatus.VERIFIED_FRESH;
  let aiSuspicionScore = 0.0;

  // 1. Check Repo Creation Date
  if (new Date(repo.createdAt) < hackathonStartTime) {
    status = AntiCheatStatus.PRE_EXISTING_FLAG;
    reasons.push(
      `Repository created on ${new Date(repo.createdAt).toISOString()}, which is BEFORE the hackathon start time (${hackathonStartTime.toISOString()}).`
    );
  }

  // 2. Check Earliest Commit Date
  if (repo.commits.length > 0) {
    const firstCommit = repo.commits[0];
    if (new Date(firstCommit.timestamp) < hackathonStartTime) {
      status = AntiCheatStatus.PRE_EXISTING_FLAG;
      flaggedCommits.push(firstCommit.sha);
      reasons.push(
        `First commit (${firstCommit.sha.substring(0, 7)}) timestamp (${new Date(firstCommit.timestamp).toISOString()}) is before hackathon start time.`
      );
    }
  }

  // 3. Check for Giant Code Dumps (>3,000 LOC in a single commit)
  for (const commit of repo.commits) {
    if (commit.additions > 3000) {
      flaggedCommits.push(commit.sha);
      aiSuspicionScore = Math.max(aiSuspicionScore, 0.75);
      reasons.push(
        `Commit ${commit.sha.substring(0, 7)} introduces massive dump of ${commit.additions} lines. Potential pre-existing codebase copy-paste.`
      );
      if (status !== AntiCheatStatus.PRE_EXISTING_FLAG) {
        status = AntiCheatStatus.AUDIT_PENDING;
      }
    }
  }

  if (reasons.length === 0) {
    reasons.push('Verified Fresh: All commits incrementally created after hackathon start timestamp.');
  }

  const reasonSummary = reasons.join(' | ');

  // Record Audit Log in DB
  await prisma.antiCheatAuditLog.create({
    data: {
      repositoryId: repo.id,
      evaluatedStatus: status,
      hackathonStart: hackathonStartTime,
      firstCommitDate: repo.commits[0]?.timestamp || repo.createdAt,
      flaggedCommits,
      aiSuspicionScore,
      reasonSummary,
    },
  });

  // Update Repository Status
  await prisma.repository.update({
    where: { id: repo.id },
    data: { antiCheatStatus: status },
  });

  // Broadcast live anti-cheat change to UI
  broadcastAntiCheatStatus(repo.id, status, reasonSummary);

  return {
    repositoryId: repo.id,
    status,
    reasons,
    flaggedCommits,
    aiSuspicionScore,
  };
}
