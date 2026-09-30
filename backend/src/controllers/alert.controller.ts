// ============================================================
// RepoPulse — Alert Controller
// ============================================================

import { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';

export async function getAlerts(req: Request, res: Response) {
  try {
    const repositoryId = req.query.repositoryId as string;
    const limit = parseInt(req.query.limit as string || '50', 10);

    const where: any = {};
    if (repositoryId) where.repositoryId = repositoryId;

    const alerts = await prisma.alert.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return res.json({ data: alerts });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}

export async function markAlertAsRead(req: Request, res: Response) {
  try {
    const id = String(req.params.id);
    await prisma.alert.update({
      where: { id },
      data: { read: true },
    });
    return res.json({ success: true });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}

export async function getAlertRules(req: Request, res: Response) {
  try {
    const repositoryId = req.query.repositoryId as string;
    const where: any = {};
    if (repositoryId) where.repositoryId = repositoryId;

    const rules = await prisma.alertRule.findMany({ where, orderBy: { createdAt: 'desc' } });
    return res.json({ data: rules });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}

export async function createAlertRule(req: Request, res: Response) {
  try {
    const { name, event, condition, repositoryId, repositoryName, channel, webhookUrl, destination, severity } = req.body;

    const rule = await prisma.alertRule.create({
      data: {
        name,
        event: event || 'workflow_run',
        condition: condition || 'status == failed',
        repositoryId,
        repositoryName,
        channel: channel || 'SLACK',
        webhookUrl,
        destination,
        severity: severity || 'WARNING',
      },
    });

    return res.status(201).json(rule);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}
