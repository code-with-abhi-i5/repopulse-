// ============================================================
// RepoPulse — Excel & Bulk Import Controller
// ============================================================

import { Request, Response } from 'express';
import { parseExcelBuffer } from '../services/excel.service.js';
import { prisma } from '../lib/prisma.js';
import { appQueue } from '../lib/queue.js';
import { cacheService } from '../services/cache/cache.service.js';

export async function uploadExcelHandler(req: Request, res: Response) {
  try {
    if (!req.file || !req.file.buffer) {
      return res.status(400).json({ error: 'No Excel (.xlsx/.xls/.csv) file uploaded.' });
    }

    const batch = (req.body?.hackathonBatch as string) || 'HackQubit-2026';
    const startTimeStr = (req.body?.hackathonStartTime as string) || new Date().toISOString();
    const hackathonStartTime = new Date(startTimeStr);

    const { repos, errors } = parseExcelBuffer(req.file.buffer, batch);

    if (repos.length === 0) {
      return res.status(400).json({
        error: 'No valid repository links found in the uploaded file.',
        errors,
      });
    }

    const imported = [];

    for (const item of repos) {
      // 1. Upsert Team
      const teamId = `team-${item.teamName.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
      const team = await prisma.team.upsert({
        where: { id: teamId },
        create: {
          id: teamId,
          name: item.teamName,
          hackathonBatch: item.batch,
        },
        update: {
          name: item.teamName,
          hackathonBatch: item.batch,
        },
      });

      // 2. Upsert Repository initial shell
      const repo = await prisma.repository.upsert({
        where: { fullName: item.fullName },
        create: {
          githubId: BigInt(Date.now() + Math.floor(Math.random() * 100000)),
          name: item.repoName,
          fullName: item.fullName,
          owner: item.owner,
          teamId: team.id,
          teamName: team.name,
          hackathonBatch: item.batch,
          antiCheatStatus: 'AUDIT_PENDING',
          createdAt: new Date(),
          updatedAt: new Date(),
          pushedAt: new Date(),
        },
        update: {
          teamId: team.id,
          teamName: team.name,
          hackathonBatch: item.batch,
        },
      });

      // 3. Queue Deep Sync and Anti-Cheat Audit
      appQueue.add('sync-repo', {
        fullName: item.fullName,
        repositoryId: repo.id,
        teamId: team.id,
        teamName: team.name,
        hackathonBatch: item.batch,
        hackathonStartTime: hackathonStartTime.toISOString(),
      });

      imported.push({
        fullName: item.fullName,
        teamName: item.teamName,
        batch: item.batch,
        status: 'QUEUED',
      });
    }

    // Invalidate repositories cache upon new Excel bulk ingestion
    await cacheService.invalidateAllRepositories().catch(() => {});

    return res.status(201).json({
      success: true,
      message: `Successfully processed ${repos.length} repository link(s).`,
      importedCount: imported.length,
      imported,
      errors,
    });
  } catch (err: any) {
    console.error('Error uploading Excel:', err);
    return res.status(500).json({ error: err.message });
  }
}

export async function bulkAddHandler(req: Request, res: Response) {
  try {
    const { repos, hackathonBatch = 'HackQubit-2026', hackathonStartTime = new Date().toISOString() } = req.body;

    if (!Array.isArray(repos) || repos.length === 0) {
      return res.status(400).json({ error: 'Body must contain "repos" array.' });
    }

    const imported = [];
    const errors = [];

    for (const item of repos) {
      const rawUrl = item.repoUrl || item.fullName || '';
      const teamName = item.teamName || 'Independent';

      const match = rawUrl.match(/(?:https?:\/\/github\.com\/)?([a-zA-Z0-9_.-]+)\/([a-zA-Z0-9_.-]+)/i);
      if (!match) {
        errors.push({ raw: rawUrl, reason: 'Invalid GitHub URL format' });
        continue;
      }

      const owner = match[1];
      const repoName = match[2].replace(/\.git$/, '');
      const fullName = `${owner}/${repoName}`;

      const teamId = `team-${teamName.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
      const team = await prisma.team.upsert({
        where: { id: teamId },
        create: {
          id: teamId,
          name: teamName,
          hackathonBatch,
        },
        update: { hackathonBatch },
      });

      const repo = await prisma.repository.upsert({
        where: { fullName },
        create: {
          githubId: BigInt(Date.now() + Math.floor(Math.random() * 100000)),
          name: repoName,
          fullName,
          owner,
          teamId: team.id,
          teamName: team.name,
          hackathonBatch,
          antiCheatStatus: 'AUDIT_PENDING',
          createdAt: new Date(),
          updatedAt: new Date(),
          pushedAt: new Date(),
        },
        update: {
          teamId: team.id,
          teamName: team.name,
          hackathonBatch,
        },
      });

      appQueue.add('sync-repo', {
        fullName,
        repositoryId: repo.id,
        teamId: team.id,
        teamName: team.name,
        hackathonBatch,
        hackathonStartTime,
      });

      imported.push({ fullName, teamName, status: 'QUEUED' });
    }

    // Invalidate repositories cache upon new bulk repositories add
    await cacheService.invalidateAllRepositories().catch(() => {});

    return res.status(201).json({
      success: true,
      importedCount: imported.length,
      imported,
      errors,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}
