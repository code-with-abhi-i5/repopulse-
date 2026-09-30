// ============================================================
// RepoPulse — Automated Background Poller Cron (Zero-Webhook Live Updates)
// ============================================================

import { prisma } from '../lib/prisma.js';
import { getOctokitClient } from '../lib/octokit.js';
import { calculateHealthScore } from '../services/health.service.js';
import { broadcastActivityEvent } from '../lib/socket.js';

let pollerInterval: NodeJS.Timeout | null = null;
let isPolling = false;

export function startBackgroundPoller(intervalSeconds: number = 90) {
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
      console.warn(`⚠️ [Poller Cron] Error during polling cycle: ${err.message}`);
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
  const repos = await prisma.repository.findMany({
    take: 50,
    orderBy: { updatedAt: 'asc' },
  });

  if (repos.length === 0) return;

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
        console.log(`⚡ [Poller] New activity detected in ${repo.fullName}!`);

        // Fetch latest commit
        const { data: latestCommits } = await octokit.rest.repos.listCommits({
          owner,
          repo: name,
          per_page: 3,
        });

        if (latestCommits.length > 0) {
          const topCommit = latestCommits[0];

          // Fetch detailed commit to get stats (lines added/deleted)
          let linesAdded = 0;
          let linesDeleted = 0;
          try {
            const { data: detailedCommit } = await octokit.rest.repos.getCommit({
              owner,
              repo: name,
              ref: topCommit.sha,
            });
            if (detailedCommit.stats) {
              linesAdded = detailedCommit.stats.additions || 0;
              linesDeleted = detailedCommit.stats.deletions || 0;
            }
          } catch (e) {
            // Ignore if commit stats fetch fails
          }

          const authorLogin = topCommit.author?.login || topCommit.commit.author?.name || 'contributor';

          // Update repository pushedAt
          await prisma.repository.update({
            where: { id: repo.id },
            data: {
              pushedAt: remotePushedAt,
              stars: ghRepo.stargazers_count,
              forks: ghRepo.forks_count,
              openIssues: ghRepo.open_issues_count,
            },
          });

          // Create Activity Event
          const activity = await prisma.activityEvent.create({
            data: {
              type: 'PUSH',
              repositoryId: repo.id,
              repositoryName: repo.name,
              teamName: repo.teamName,
              actorLogin: authorLogin,
              actorName: topCommit.commit.author?.name || authorLogin,
              actorAvatarUrl: topCommit.author?.avatar_url || null,
              timestamp: new Date(),
              title: `New push to ${repo.name}: ${topCommit.commit.message.slice(0, 50)}`,
              description: topCommit.commit.message,
              url: topCommit.html_url,
              branch: ghRepo.default_branch,
              commitSha: topCommit.sha.slice(0, 7),
              linesAdded,
              linesDeleted,
            },
          });

          // Broadcast live activity to frontend via WebSocket
          broadcastActivityEvent(activity);

          // Recompute Health Score
          await calculateHealthScore(repo.id);
        }
      }
    } catch (err: any) {
      // Ignore individual rate limit / network hiccups for a single repo
      continue;
    }
  }
}
