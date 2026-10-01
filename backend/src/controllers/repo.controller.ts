// ============================================================
// RepoPulse — Repository Controller
// ============================================================

import { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { calculateHealthScore } from '../services/health.service.js';
import { runAntiCheatAudit } from '../services/anticheat.service.js';
import { syncRepository } from '../services/github.service.js';
import { appQueue } from '../lib/queue.js';
import { cacheService, cacheKeys, CACHE_TTL } from '../services/cache/cache.service.js';

export async function getRepositories(req: Request, res: Response) {
  try {
    const page = parseInt(req.query.page as string || '1', 10);
    const limit = parseInt(req.query.limit as string || '50', 10);
    const search = (req.query.search as string || '').trim();
    const language = req.query.language as string;
    const antiCheatStatus = req.query.antiCheatStatus as any;
    const batch = req.query.batch as string;
    const sortBy = (req.query.sortBy as string || 'healthScore');

    // Generate deterministic cache key
    const cacheKey = cacheKeys.reposList({
      page,
      limit,
      search,
      language,
      antiCheatStatus,
      batch,
      sortBy,
    });

    const responsePayload = await cacheService.getOrSet(
      cacheKey,
      async () => {
        const where: any = {};

        if (search) {
          where.OR = [
            { name: { contains: search, mode: 'insensitive' } },
            { fullName: { contains: search, mode: 'insensitive' } },
            { owner: { contains: search, mode: 'insensitive' } },
            { teamName: { contains: search, mode: 'insensitive' } },
          ];
        }

        if (language && language !== 'all') {
          where.language = { equals: language, mode: 'insensitive' };
        }

        if (antiCheatStatus && antiCheatStatus !== 'all') {
          where.antiCheatStatus = antiCheatStatus;
        }

        if (batch && batch !== 'all') {
          where.hackathonBatch = batch;
        }

        const orderBy: any = {};
        if (sortBy === 'stars') orderBy.stars = 'desc';
        else if (sortBy === 'pushedAt') orderBy.pushedAt = 'desc';
        else if (sortBy === 'healthScore') orderBy.healthScore = 'desc';
        else orderBy.updatedAt = 'desc';

        const [total, repositories] = await Promise.all([
          prisma.repository.count({ where }),
          prisma.repository.findMany({
            where,
            include: {
              _count: {
                select: {
                  commits: true,
                  pullRequests: true,
                  issues: true,
                },
              },
            },
            orderBy,
            skip: (page - 1) * limit,
            take: limit,
          }),
        ]);

        // Format BigInt githubId and attach counts for JSON serialization
        const formatted = repositories.map((r: any) => ({
          ...r,
          githubId: Number(r.githubId),
          commitsCount: r._count?.commits || 0,
          commits: r._count?.commits || 0,
        }));

        return {
          data: formatted,
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        };
      },
      CACHE_TTL.REPOS_LIST
    );

    return res.json(responsePayload);
  } catch (err: any) {
    console.error('Error fetching repositories:', err);
    return res.status(500).json({ error: err.message });
  }
}

export async function getRepositoryById(req: Request, res: Response) {
  try {
    const id = String(req.params.id);
    const fresh = req.query.fresh === 'true';
    const cacheKey = cacheKeys.repoDetail(id);

    if (fresh) {
      await cacheService.delete(cacheKey);
    }

    const repo = await cacheService.getOrSet(
      cacheKey,
      async () => {
        const data = await prisma.repository.findFirst({
          where: {
            OR: [
              { id },
              { fullName: { equals: id, mode: 'insensitive' } },
            ],
          },
          include: {
            commits: { take: 50, orderBy: { timestamp: 'desc' } },
            pullRequests: { take: 20, orderBy: { createdAt: 'desc' } },
            issues: { take: 20, orderBy: { createdAt: 'desc' } },
            auditLogs: { take: 5, orderBy: { auditedAt: 'desc' } },
          },
        });

        if (!data) return null;

        return {
          ...data,
          githubId: Number(data.githubId),
        };
      },
      CACHE_TTL.REPO_DETAIL
    );

    if (!repo) {
      return res.status(404).json({ error: 'Repository not found' });
    }

    return res.json(repo);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}

export async function getRepositoryHealth(req: Request, res: Response) {
  try {
    const id = String(req.params.id);
    const cacheKey = cacheKeys.repoHealth(id);

    const breakdown = await cacheService.getOrSet(
      cacheKey,
      () => calculateHealthScore(id),
      CACHE_TTL.REPO_HEALTH
    );

    return res.json(breakdown);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}

export async function runAuditEndpoint(req: Request, res: Response) {
  try {
    const id = String(req.params.id);
    const startTimeStr = req.body?.hackathonStartTime || req.query?.hackathonStartTime;
    const hackathonStartTime = startTimeStr ? new Date(startTimeStr as string) : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const audit = await runAntiCheatAudit(id, hackathonStartTime);
    
    // Invalidate cached repository detail & health score after audit run
    await cacheService.invalidateRepository(id);

    return res.json(audit);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}

export async function syncSingleRepoEndpoint(req: Request, res: Response) {
  const fullName = String(req.body?.fullName || req.params?.fullName || '');
  try {
    if (!fullName) {
      return res.status(400).json({ error: 'Missing fullName (owner/repo)' });
    }

    console.log(`🔄 [Manual Sync] Processing immediate sync for ${fullName}...`);

    // Synchronously sync so the user immediately gets fresh commits
    const repo = await syncRepository(fullName, {
      teamName: req.body?.teamName,
      hackathonBatch: req.body?.hackathonBatch,
    });

    // Invalidate caches
    await cacheService.invalidateRepository(repo.id, fullName);
    await cacheService.invalidateContributors();

    return res.status(200).json({
      message: `Sync completed successfully for ${fullName}`,
      status: 'SUCCESS',
      repository: repo,
    });
  } catch (err: any) {
    console.error(`❌ [Manual Sync Error] ${fullName}:`, err.message);
    return res.status(500).json({ error: err.message });
  }
}

export async function deleteRepository(req: Request, res: Response) {
  try {
    const id = String(req.params.id);
    await prisma.repository.delete({ where: { id } });

    // Target invalidation of repo detail, health, and list caches
    await cacheService.invalidateRepository(id);

    return res.json({ success: true, message: `Repository ${id} deleted.` });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}
