// ============================================================
// RepoPulse — GitHub Public Sync Engine
// ============================================================

import { getOctokitClient } from '../lib/octokit.js';
import { prisma } from '../lib/prisma.js';
import { calculateHealthScore } from './health.service.js';
import { broadcastActivityEvent } from '../lib/socket.js';
import { cacheService } from './cache/cache.service.js';

export async function syncRepository(
  fullName: string,
  extraMeta?: {
    teamId?: string;
    teamName?: string;
    hackathonBatch?: string;
    hackathonStartTime?: Date;
  }
) {
  const [owner, repoName] = fullName.split('/');
  if (!owner || !repoName) {
    throw new Error(`Invalid repo format: ${fullName}. Expected "owner/repo".`);
  }

  const octokit = getOctokitClient();

  console.log(`🔄 [GitHub Sync] Starting sync for ${fullName}...`);

  // 1. Fetch Repository Metadata
  const { data: repoData } = await octokit.rest.repos.get({
    owner,
    repo: repoName,
  });

  // Upsert Repository record
  const repo = await prisma.repository.upsert({
    where: { fullName },
    create: {
      githubId: BigInt(repoData.id),
      name: repoData.name,
      fullName: repoData.full_name,
      owner: repoData.owner.login,
      description: repoData.description || '',
      visibility: repoData.private ? 'PRIVATE' : 'PUBLIC',
      defaultBranch: repoData.default_branch,
      license: repoData.license?.spdx_id || repoData.license?.name || null,
      language: repoData.language || 'Unknown',
      createdAt: new Date(repoData.created_at),
      updatedAt: new Date(repoData.updated_at),
      pushedAt: new Date(repoData.pushed_at || repoData.updated_at),
      stars: repoData.stargazers_count,
      forks: repoData.forks_count,
      watchers: repoData.watchers_count,
      openIssues: repoData.open_issues_count,
      sizeKb: repoData.size,
      archived: repoData.archived,
      topics: repoData.topics || [],
      teamId: extraMeta?.teamId,
      teamName: extraMeta?.teamName,
      hackathonBatch: extraMeta?.hackathonBatch,
      antiCheatStatus: 'AUDIT_PENDING',
    },
    update: {
      description: repoData.description || '',
      visibility: repoData.private ? 'PRIVATE' : 'PUBLIC',
      defaultBranch: repoData.default_branch,
      language: repoData.language || 'Unknown',
      updatedAt: new Date(repoData.updated_at),
      pushedAt: new Date(repoData.pushed_at || repoData.updated_at),
      stars: repoData.stargazers_count,
      forks: repoData.forks_count,
      watchers: repoData.watchers_count,
      openIssues: repoData.open_issues_count,
      sizeKb: repoData.size,
      archived: repoData.archived,
      topics: repoData.topics || [],
      teamName: extraMeta?.teamName || undefined,
      hackathonBatch: extraMeta?.hackathonBatch || undefined,
    },
  });

  // 2. Fetch Contributors
  try {
    const { data: contributors } = await octokit.rest.repos.listContributors({
      owner,
      repo: repoName,
      per_page: 30,
    });

    for (const c of contributors) {
      if (!c.login) continue;
      await prisma.contributor.upsert({
        where: { login: c.login },
        create: {
          login: c.login,
          avatarUrl: c.avatar_url,
          totalCommits: c.contributions || 0,
          teamName: extraMeta?.teamName,
          primaryRepo: fullName,
          repositories: [fullName],
          isBot: c.type === 'Bot' || c.login.includes('[bot]'),
        },
        update: {
          avatarUrl: c.avatar_url,
          totalCommits: { increment: c.contributions || 0 },
          teamName: extraMeta?.teamName || undefined,
        },
      });
    }
  } catch (err: any) {
    console.warn(`⚠️ [GitHub Sync] Could not fetch contributors for ${fullName}: ${err.message}`);
  }

  // 3. Fetch Recent Commits
  try {
    const { data: commits } = await octokit.rest.repos.listCommits({
      owner,
      repo: repoName,
      per_page: 50,
    });

    for (const c of commits) {
      const authorLogin = c.author?.login || c.commit.author?.name || 'unknown';

      // Ensure author contributor exists
      if (c.author?.login) {
        await prisma.contributor.upsert({
          where: { login: c.author.login },
          create: {
            login: c.author.login,
            avatarUrl: c.author.avatar_url,
            primaryRepo: fullName,
            repositories: [fullName],
          },
          update: {},
        });
      }

      // Check if commit already exists
      const existingCommit = await prisma.commit.findUnique({
        where: { sha: c.sha },
        select: { id: true, additions: true, deletions: true }
      });

      let additions = existingCommit?.additions || 0;
      let deletions = existingCommit?.deletions || 0;
      let filesChanged = 1;

      // Only fetch detailed commit if we don't have stats yet
      if (!existingCommit || (additions === 0 && deletions === 0)) {
        try {
          const { data: detailedCommit } = await octokit.rest.repos.getCommit({
            owner,
            repo: repoName,
            ref: c.sha,
          });
          if (detailedCommit.stats) {
            additions = detailedCommit.stats.additions || 0;
            deletions = detailedCommit.stats.deletions || 0;
          }
          if (detailedCommit.files) {
            filesChanged = detailedCommit.files.length;
          }
        } catch (detailErr) {
          console.warn(`Could not fetch details for commit ${c.sha}`);
        }
      }

      await prisma.commit.upsert({
        where: { sha: c.sha },
        create: {
          sha: c.sha,
          message: c.commit.message,
          authorLogin: c.author?.login || 'unknown',
          branch: repoData.default_branch,
          repositoryId: repo.id,
          timestamp: new Date(c.commit.author?.date || Date.now()),
          additions,
          deletions,
          filesChanged,
          url: c.html_url,
          isBulkDump: false,
        },
        update: {
          additions,
          deletions,
          filesChanged,
        },
      });
      
      // Update the contributor's overall additions/deletions, commits count, and repository affiliations
      if (authorLogin !== 'unknown') {
        const stats = await prisma.commit.aggregate({
          where: { authorLogin },
          _sum: { additions: true, deletions: true },
          _count: { _all: true }
        });
        const existingContrib = await prisma.contributor.findUnique({
          where: { login: authorLogin },
          select: { repositories: true, primaryRepo: true }
        });
        const currentRepos = existingContrib?.repositories || [];
        const updatedRepos = currentRepos.includes(fullName) ? currentRepos : [...currentRepos, fullName];
        const totalCommits = stats._count._all || 0;

        await prisma.contributor.updateMany({
          where: { login: authorLogin },
          data: {
            additions: stats._sum.additions || 0,
            deletions: stats._sum.deletions || 0,
            totalCommits,
            pushesCount: Math.max(1, Math.ceil(totalCommits * 0.7)),
            repositories: updatedRepos,
            primaryRepo: existingContrib?.primaryRepo || fullName,
          }
        });
      }
    }
  } catch (err: any) {
    console.warn(`⚠️ [GitHub Sync] Could not fetch commits for ${fullName}: ${err.message}`);
  }

  // 4. Fetch Pull Requests
  try {
    const { data: prs } = await octokit.rest.pulls.list({
      owner,
      repo: repoName,
      state: 'all',
      per_page: 30,
    });

    for (const p of prs) {
      const authorLogin = p.user?.login || 'unknown';
      if (p.user?.login) {
        await prisma.contributor.upsert({
          where: { login: p.user.login },
          create: {
            login: p.user.login,
            avatarUrl: p.user.avatar_url,
            primaryRepo: fullName,
            repositories: [fullName],
          },
          update: {},
        });
      }

      const createdAt = new Date(p.created_at);
      const mergedAt = p.merged_at ? new Date(p.merged_at) : null;
      let mergeTimeHours: number | null = null;
      if (mergedAt) {
        mergeTimeHours = (mergedAt.getTime() - createdAt.getTime()) / (1000 * 60 * 60);
      }

      await prisma.pullRequest.upsert({
        where: {
          repositoryId_number: {
            repositoryId: repo.id,
            number: p.number,
          },
        },
        create: {
          number: p.number,
          title: p.title,
          state: p.merged_at ? 'MERGED' : p.state === 'closed' ? 'CLOSED' : 'OPEN',
          authorLogin,
          repositoryId: repo.id,
          createdAt,
          updatedAt: new Date(p.updated_at),
          mergedAt,
          closedAt: p.closed_at ? new Date(p.closed_at) : null,
          mergeTimeHours,
          isDraft: p.draft || false,
          url: p.html_url,
          labels: p.labels.map((l: any) => ({ name: l.name, color: l.color })),
        },
        update: {
          title: p.title,
          state: p.merged_at ? 'MERGED' : p.state === 'closed' ? 'CLOSED' : 'OPEN',
          updatedAt: new Date(p.updated_at),
          mergedAt,
          mergeTimeHours,
        },
      });
    }
  } catch (err: any) {
    console.warn(`⚠️ [GitHub Sync] Could not fetch PRs for ${fullName}: ${err.message}`);
  }

  // 4.5 Fetch Issues
  try {
    const { data: issues } = await octokit.rest.issues.listForRepo({
      owner,
      repo: repoName,
      state: 'all',
      per_page: 30,
    });

    for (const i of issues) {
      if (i.pull_request) continue; // Skip PRs, handled separately

      const authorLogin = i.user?.login || 'unknown';
      if (i.user?.login) {
        await prisma.contributor.upsert({
          where: { login: i.user.login },
          create: {
            login: i.user.login,
            avatarUrl: i.user.avatar_url,
            primaryRepo: fullName,
            repositories: [fullName],
          },
          update: {},
        });
      }

      await prisma.issue.upsert({
        where: {
          repositoryId_number: {
            repositoryId: repo.id,
            number: i.number,
          },
        },
        create: {
          number: i.number,
          title: i.title,
          state: i.state === 'closed' ? 'CLOSED' : 'OPEN',
          authorLogin,
          repositoryId: repo.id,
          createdAt: new Date(i.created_at),
          updatedAt: new Date(i.updated_at),
          closedAt: i.closed_at ? new Date(i.closed_at) : null,
          url: i.html_url,
          labels: typeof i.labels === 'object' ? i.labels.map((l: any) => ({ name: l.name || l, color: l.color || 'cccccc' })) : [],
        },
        update: {
          title: i.title,
          state: i.state === 'closed' ? 'CLOSED' : 'OPEN',
          updatedAt: new Date(i.updated_at),
          closedAt: i.closed_at ? new Date(i.closed_at) : null,
        },
      });
    }
  } catch (err: any) {
    console.warn(`⚠️ [GitHub Sync] Could not fetch issues for ${fullName}: ${err.message}`);
  }

  // 5. Calculate Health Score
  try {
    await calculateHealthScore(repo.id);
  } catch (err: any) {
    console.warn(`⚠️ [GitHub Sync] Health score calc warning: ${err.message}`);
  }

  // 6. Broadcast Real-time Activity
  broadcastActivityEvent({
    id: `sync-${Date.now()}`,
    type: 'PUSH',
    repositoryId: repo.id,
    repositoryName: repo.name,
    teamName: repo.teamName,
    actorLogin: owner,
    title: `Repository ${fullName} successfully synced`,
    timestamp: new Date().toISOString(),
  });

  // 7. Invalidate Caches for Repo and Contributors
  try {
    await cacheService.invalidateRepository(repo.id, fullName);
    await cacheService.invalidateContributors();
  } catch (cErr: any) {
    console.warn(`⚠️ [GitHub Sync] Cache invalidation notice: ${cErr.message}`);
  }

  console.log(`✅ [GitHub Sync] Finished sync for ${fullName}!`);
  return repo;
}
