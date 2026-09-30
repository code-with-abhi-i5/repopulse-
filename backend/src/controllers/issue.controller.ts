// ============================================================
// RepoPulse — Issues Controller
// ============================================================

import { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';

export async function getIssues(req: Request, res: Response) {
  try {
    const repositoryId = req.query.repositoryId as string;
    const state = req.query.state as any;
    const limit = parseInt(req.query.limit as string || '50', 10);

    const where: any = {};
    if (repositoryId) where.repositoryId = repositoryId;
    if (state && state !== 'all') where.state = state.toUpperCase();

    const issues = await prisma.issue.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return res.json({ data: issues });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}
