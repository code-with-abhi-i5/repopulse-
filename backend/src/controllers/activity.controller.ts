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
    const fresh = req.query.fresh === 'true';

    const cacheKey = cacheKeys.activitiesList({ limit, repositoryId, type });

    if (fresh) {
      await cacheService.delete(cacheKey).catch(() => {});
      const where: any = {};
      if (repositoryId) where.repositoryId = repositoryId;
      if (type) where.type = type;

      const freshActivities = await prisma.activityEvent.findMany({
        where,
        orderBy: { timestamp: 'desc' },
        take: limit,
      });

      return res.json({ data: freshActivities });
    }

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
      30 // 30s TTL for real-time telemetry streaming
    );

    return res.json({ data: activities });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}
