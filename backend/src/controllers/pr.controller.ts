// ============================================================
// RepoPulse — Pull Request Controller
// ============================================================

import { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';

export async function getPullRequests(req: Request, res: Response) {
  try {
    const repositoryId = req.query.repositoryId as string;
    const state = req.query.state as any;
    const limit = parseInt(req.query.limit as string || '50', 10);

    const where: any = {};
    if (repositoryId) where.repositoryId = repositoryId;
    if (state && state !== 'all') where.state = state.toUpperCase();

    const prs = await prisma.pullRequest.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return res.json({ data: prs });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}
