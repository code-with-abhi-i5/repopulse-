// ============================================================
// RepoPulse — Admin API Key Middleware (Zero-Auth Organizer PIN)
// ============================================================

import { Request, Response, NextFunction } from 'express';
import { ENV } from '../config/env.js';

export function requireAdminKey(req: Request, res: Response, next: NextFunction) {
  const adminKey = req.headers['x-admin-key'] as string;

  // In development, if no key configured, allow by default
  if (!ENV.ADMIN_API_KEY) {
    return next();
  }

  if (!adminKey || adminKey !== ENV.ADMIN_API_KEY) {
    return res.status(401).json({
      error: 'Unauthorized. Valid "x-admin-key" header is required for organizer actions.',
    });
  }

  next();
}
