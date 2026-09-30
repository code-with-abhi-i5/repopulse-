// ============================================================
// RepoPulse — GitHub Webhook Controller
// ============================================================

import { Request, Response } from 'express';
import crypto from 'crypto';
import { ENV } from '../config/env.js';
import { appQueue } from '../lib/queue.js';

export async function handleGitHubWebhook(req: Request, res: Response) {
  const event = req.headers['x-github-event'] as string;
  const signature = req.headers['x-hub-signature-256'] as string;
  const deliveryId = req.headers['x-github-delivery'] as string;

  // Verify HMAC signature if secret is configured
  if (ENV.GITHUB_WEBHOOK_SECRET && signature) {
    const rawBody = (req as any).rawBody || JSON.stringify(req.body);
    const expected = `sha256=${crypto
      .createHmac('sha256', ENV.GITHUB_WEBHOOK_SECRET)
      .update(rawBody)
      .digest('hex')}`;

    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) {
      return res.status(401).json({ error: 'Invalid HMAC signature.' });
    }
  }

  // Fast 202 Accepted (<50ms)
  res.status(202).json({ received: true, deliveryId });

  // Process event in background
  appQueue.add('github-webhook', {
    event,
    payload: req.body,
    deliveryId,
  });
}
