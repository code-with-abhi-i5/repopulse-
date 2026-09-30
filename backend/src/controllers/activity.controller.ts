// ============================================================
// RepoPulse — Activity Controller
// ============================================================

import { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';

export async function getActivities(req: Request, res: Response) {
  try {
    const limit = parseInt(req.query.limit as string || '50', 10);
    const repositoryId = req.query.repositoryId as string;
    const type = req.query.type as any;

    const where: any = {};
    if (repositoryId) where.repositoryId = repositoryId;
    if (type) where.type = type;

    const activities = await prisma.activityEvent.findMany({
      where,
      orderBy: { timestamp: 'desc' },
      take: limit,
    });

    return res.json({ data: activities });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}
