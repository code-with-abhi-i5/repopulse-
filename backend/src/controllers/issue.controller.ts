// ============================================================
// RepoPulse — Issues Controller
// ============================================================

import { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { cacheService, cacheKeys, CACHE_TTL } from '../services/cache/cache.service.js';

export async function getIssues(req: Request, res: Response) {
  try {
    const repositoryId = req.query.repositoryId as string;
    const state = req.query.state as any;
    const limit = parseInt(req.query.limit as string || '50', 10);

    const cacheKey = cacheKeys.issuesList({ limit, repositoryId, state });

    const issues = await cacheService.getOrSet(
      cacheKey,
      async () => {
        const where: any = {};
        if (repositoryId) where.repositoryId = repositoryId;
        if (state && state !== 'all') where.state = state.toUpperCase();

        return prisma.issue.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          take: limit,
        });
      },
      CACHE_TTL.ISSUES_LIST
    );

    return res.json({ data: issues });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}
