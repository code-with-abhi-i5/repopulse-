// ============================================================
// RepoPulse — Repository Controller
// ============================================================

import { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { calculateHealthScore } from '../services/health.service.js';
import { runAntiCheatAudit } from '../services/anticheat.service.js';
import { syncRepository } from '../services/github.service.js';
import { appQueue } from '../lib/queue.js';

export async function getRepositories(req: Request, res: Response) {
  try {
    const page = parseInt(req.query.page as string || '1', 10);
    const limit = parseInt(req.query.limit as string || '50', 10);
    const search = (req.query.search as string || '').trim();
    const language = req.query.language as string;
    const antiCheatStatus = req.query.antiCheatStatus as any;
    const batch = req.query.batch as string;
    const sortBy = (req.query.sortBy as string || 'healthScore');

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
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    // Format BigInt githubId for JSON serialization
    const formatted = repositories.map((r) => ({
      ...r,
      githubId: Number(r.githubId),
    }));

    return res.json({
      data: formatted,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err: any) {
    console.error('Error fetching repositories:', err);
    return res.status(500).json({ error: err.message });
  }
}

export async function getRepositoryById(req: Request, res: Response) {
  try {
    const id = String(req.params.id);
    const repo = await prisma.repository.findFirst({
      where: {
        OR: [{ id }, { fullName: id }],
      },
      include: {
        commits: { take: 20, orderBy: { timestamp: 'desc' } },
        pullRequests: { take: 10, orderBy: { createdAt: 'desc' } },
        issues: { take: 10, orderBy: { createdAt: 'desc' } },
        auditLogs: { take: 5, orderBy: { auditedAt: 'desc' } },
      },
    });

    if (!repo) {
      return res.status(404).json({ error: 'Repository not found' });
    }

    return res.json({
      ...repo,
      githubId: Number(repo.githubId),
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}

export async function getRepositoryHealth(req: Request, res: Response) {
  try {
    const id = String(req.params.id);
    const breakdown = await calculateHealthScore(id);
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
    return res.json(audit);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}

export async function syncSingleRepoEndpoint(req: Request, res: Response) {
  try {
    const fullName = String(req.body?.fullName || req.params.fullName || '');
    if (!fullName) {
      return res.status(400).json({ error: 'Missing fullName (owner/repo)' });
    }

    // Queue sync in background
    appQueue.add('sync-repo', {
      fullName,
      teamName: req.body?.teamName,
      hackathonBatch: req.body?.hackathonBatch,
    });

    return res.status(202).json({
      message: `Sync queued for ${fullName}`,
      status: 'QUEUED',
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}

export async function deleteRepository(req: Request, res: Response) {
  try {
    const id = String(req.params.id);
    await prisma.repository.delete({ where: { id } });
    return res.json({ success: true, message: `Repository ${id} deleted.` });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}
