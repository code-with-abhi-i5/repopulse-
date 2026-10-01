// ============================================================
// RepoPulse — Contributor Controller
// ============================================================

import { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { cacheService, cacheKeys, CACHE_TTL } from '../services/cache/cache.service.js';

export async function getContributors(req: Request, res: Response) {
  try {
    const limit = parseInt(req.query.limit as string || '50', 10);
    const teamName = req.query.teamName as string;

    const cacheKey = cacheKeys.contributorsList({ limit, teamName });

    const contributors = await cacheService.getOrSet(
      cacheKey,
      async () => {
        const where: any = {};
        if (teamName) where.teamName = teamName;

        return prisma.contributor.findMany({
          where,
          orderBy: { totalCommits: 'desc' },
          take: limit,
        });
      },
      CACHE_TTL.CONTRIBUTORS_LIST
    );

    return res.json({ data: contributors });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}

export async function getContributorByLogin(req: Request, res: Response) {
  try {
    const login = String(req.params.login);
    const fresh = req.query.fresh === 'true';
    const cacheKey = cacheKeys.contributorDetail(login);

    if (fresh) {
      await cacheService.delete(cacheKey);
    }

    const contributor = await cacheService.getOrSet(
      cacheKey,
      async () => {
        return prisma.contributor.findFirst({
          where: {
            login: { equals: login, mode: 'insensitive' },
          },
          include: {
            commits: { take: 50, orderBy: { timestamp: 'desc' } },
            pullRequests: { take: 20, orderBy: { createdAt: 'desc' } },
            issues: { take: 20, orderBy: { createdAt: 'desc' } },
          },
        });
      },
      CACHE_TTL.CONTRIBUTOR_DETAIL
    );

    if (!contributor) {
      return res.status(404).json({ error: 'Contributor not found' });
    }

    return res.json(contributor);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}
