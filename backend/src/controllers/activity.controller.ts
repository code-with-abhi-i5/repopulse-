// ============================================================
// RepoPulse — Activity Controller
// ============================================================

import { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { cacheService, cacheKeys, CACHE_TTL } from '../services/cache/cache.service.js';

export async function getActivities(req: Request, res: Response) {
  try {
    const limit = parseInt(req.query.limit as string || '50', 10);
    const repositoryId = req.query.repositoryId as string;
    const type = req.query.type as any;

    const cacheKey = cacheKeys.activitiesList({ limit, repositoryId, type });

    const activities = await cacheService.getOrSet(
      cacheKey,
      async () => {
        const where: any = {};
        if (repositoryId) where.repositoryId = repositoryId;
        if (type) where.type = type;

        return prisma.activityEvent.findMany({
          where,
          orderBy: { timestamp: 'desc' },
          take: limit,
        });
      },
      CACHE_TTL.ACTIVITIES_LIST
    );

    return res.json({ data: activities });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}
