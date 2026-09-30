// ============================================================
// RepoPulse — Team & Multi-Repo Aggregation Controller
// ============================================================

import { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';

export async function getTeams(req: Request, res: Response) {
  try {
    const teams = await prisma.team.findMany({
      include: {
        repositories: {
          select: {
            id: true,
            name: true,
            fullName: true,
            owner: true,
            description: true,
            language: true,
            healthScore: true,
            stars: true,
            forks: true,
            openIssues: true,
            updatedAt: true,
            _count: {
              select: {
                commits: true,
                pullRequests: true,
                issues: true,
              },
            },
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    const formatted = teams.map((team) => {
      const repos = team.repositories.map((r: any) => ({
        ...r,
        commitsCount: r._count?.commits || 0,
      }));

      const totalCommits = repos.reduce((sum: number, r: any) => sum + r.commitsCount, 0);
      const totalStars = repos.reduce((sum: number, r: any) => sum + r.stars, 0);
      const totalForks = repos.reduce((sum: number, r: any) => sum + r.forks, 0);
      const totalIssues = repos.reduce((sum: number, r: any) => sum + r.openIssues, 0);
      const averageHealth =
        repos.length > 0
          ? Math.round(repos.reduce((sum: number, r: any) => sum + (r.healthScore || 80), 0) / repos.length)
          : 100;

      return {
        id: team.id,
        name: team.name,
        hackathonBatch: team.hackathonBatch,
        createdAt: team.createdAt,
        repositoriesCount: repos.length,
        totalCommits,
        totalStars,
        totalForks,
        totalIssues,
        averageHealth,
        repositories: repos,
      };
    });

    return res.json({ data: formatted, total: formatted.length });
  } catch (err: any) {
    console.error('Error fetching teams:', err);
    return res.status(500).json({ error: err.message });
  }
}
