// ============================================================
// RepoPulse — Contributor Controller
// ============================================================

import { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';

export async function getContributors(req: Request, res: Response) {
  try {
    const limit = parseInt(req.query.limit as string || '50', 10);
    const teamName = req.query.teamName as string;

    const where: any = {};
    if (teamName) where.teamName = teamName;

    const contributors = await prisma.contributor.findMany({
      where,
      orderBy: { totalCommits: 'desc' },
      take: limit,
    });

    return res.json({ data: contributors });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}

export async function getContributorByLogin(req: Request, res: Response) {
  try {
    const login = String(req.params.login);
    const contributor = await prisma.contributor.findUnique({
      where: { login },
      include: {
        commits: { take: 20, orderBy: { timestamp: 'desc' } },
        pullRequests: { take: 10, orderBy: { createdAt: 'desc' } },
      },
    });

    if (!contributor) {
      return res.status(404).json({ error: 'Contributor not found' });
    }

    return res.json(contributor);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}
