// ============================================================
// RepoPulse — Admin API Key Middleware (Zero-Auth Organizer PIN)
// ============================================================

import { Request, Response, NextFunction } from 'express';
import { ENV } from '../config/env.js';
import { verifySessionToken } from '../controllers/auth.controller.js';

export function requireAdminKey(req: Request, res: Response, next: NextFunction) {
  const adminKey = req.headers['x-admin-key'] as string;
  const authHeader = req.headers['authorization'] as string;

  // In development, if no key configured, allow by default
  if (!ENV.ADMIN_API_KEY) {
    return next();
  }

  // 1. Direct admin API key match
  if (adminKey && adminKey === ENV.ADMIN_API_KEY) {
    return next();
  }

  // 2. Logged-in admin session token
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7).trim();
    const userId = verifySessionToken(token);
    if (userId) {
      return next();
    }
  }

  return res.status(401).json({
    error: 'Unauthorized. Valid "x-admin-key" header or admin session token is required.',
  });
}
