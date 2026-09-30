// ============================================================
// RepoPulse — Admin Authentication Controller
// ============================================================

import { Request, Response } from 'express';
import crypto from 'crypto';
import { prisma } from '../lib/prisma.js';
import { ENV } from '../config/env.js';

function hashPassword(password: string, salt: string): string {
  return crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
}

function generateSessionToken(userId: string): string {
  const payload = `${userId}:${Date.now()}:${crypto.randomBytes(16).toString('hex')}`;
  const signature = crypto.createHmac('sha256', ENV.ADMIN_API_KEY).update(payload).digest('hex');
  return Buffer.from(`${payload}:${signature}`).toString('base64');
}

export function verifySessionToken(token: string): string | null {
  try {
    const decoded = Buffer.from(token, 'base64').toString('utf8');
    const parts = decoded.split(':');
    if (parts.length !== 4) return null;

    const [userId, timestampStr, randomStr, signature] = parts;
    const payload = `${userId}:${timestampStr}:${randomStr}`;
    const expected = crypto.createHmac('sha256', ENV.ADMIN_API_KEY).update(payload).digest('hex');

    if (crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) {
      return userId;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * POST /api/v1/auth/login
 */
export async function login(req: Request, res: Response) {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username (or email) and password are required.' });
    }

    const trimmedIdentifier = username.trim().toLowerCase();

    // Query admin account by username or email
    const accounts: any[] = await prisma.$queryRaw`
      SELECT id, username, email, name, password_hash, salt
      FROM "AdminAccount"
      WHERE LOWER(username) = ${trimmedIdentifier} OR LOWER(email) = ${trimmedIdentifier}
      LIMIT 1;
    `;

    if (accounts.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials. User not found.' });
    }

    const admin = accounts[0];
    const incomingHash = hashPassword(password, admin.salt);

    if (incomingHash !== admin.password_hash) {
      return res.status(401).json({ error: 'Invalid password. Please check your credentials.' });
    }

    const token = generateSessionToken(admin.id);

    return res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: admin.id,
        username: admin.username,
        email: admin.email,
        name: admin.name,
        role: 'ADMIN',
      },
    });
  } catch (err: any) {
    console.error('Error during login:', err);
    return res.status(500).json({ error: 'Authentication failed due to a server error.' });
  }
}

/**
 * POST /api/v1/auth/change-password
 */
export async function changePassword(req: Request, res: Response) {
  try {
    const { username, currentPassword, newPassword } = req.body;

    if (!username || !currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Username, current password, and new password are required.' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters long.' });
    }

    const trimmedIdentifier = username.trim().toLowerCase();

    const accounts: any[] = await prisma.$queryRaw`
      SELECT id, username, password_hash, salt
      FROM "AdminAccount"
      WHERE LOWER(username) = ${trimmedIdentifier} OR LOWER(email) = ${trimmedIdentifier}
      LIMIT 1;
    `;

    if (accounts.length === 0) {
      return res.status(404).json({ error: 'Admin account not found.' });
    }

    const admin = accounts[0];
    const currentHash = hashPassword(currentPassword, admin.salt);

    if (currentHash !== admin.password_hash) {
      return res.status(401).json({ error: 'Current password does not match.' });
    }

    // Generate new salt and hash
    const newSalt = crypto.randomBytes(16).toString('hex');
    const newHash = hashPassword(newPassword, newSalt);

    await prisma.$executeRawUnsafe(`
      UPDATE "AdminAccount"
      SET password_hash = $1, salt = $2, updated_at = NOW()
      WHERE id = $3;
    `, newHash, newSalt, admin.id);

    return res.json({
      success: true,
      message: 'Password successfully updated! You can now log in with your new password.',
    });
  } catch (err: any) {
    console.error('Error changing password:', err);
    return res.status(500).json({ error: 'Failed to update password.' });
  }
}

/**
 * POST /api/v1/auth/reset-password
 * Emergency password reset using admin master recovery key (from ENV.ADMIN_API_KEY)
 */
export async function resetPassword(req: Request, res: Response) {
  try {
    const { username, recoveryKey, newPassword } = req.body;

    if (!username || !recoveryKey || !newPassword) {
      return res.status(400).json({ error: 'Username, master recovery key, and new password are required.' });
    }

    if (recoveryKey !== ENV.ADMIN_API_KEY) {
      return res.status(403).json({ error: 'Invalid master recovery key.' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters long.' });
    }

    const trimmedIdentifier = username.trim().toLowerCase();

    const accounts: any[] = await prisma.$queryRaw`
      SELECT id FROM "AdminAccount"
      WHERE LOWER(username) = ${trimmedIdentifier} OR LOWER(email) = ${trimmedIdentifier}
      LIMIT 1;
    `;

    if (accounts.length === 0) {
      return res.status(404).json({ error: 'Admin account not found.' });
    }

    const admin = accounts[0];
    const newSalt = crypto.randomBytes(16).toString('hex');
    const newHash = hashPassword(newPassword, newSalt);

    await prisma.$executeRawUnsafe(`
      UPDATE "AdminAccount"
      SET password_hash = $1, salt = $2, updated_at = NOW()
      WHERE id = $3;
    `, newHash, newSalt, admin.id);

    return res.json({
      success: true,
      message: 'Password has been reset successfully using recovery key.',
    });
  } catch (err: any) {
    console.error('Error resetting password:', err);
    return res.status(500).json({ error: 'Failed to reset password.' });
  }
}

/**
 * GET /api/v1/auth/me
 */
export async function getMe(req: Request, res: Response) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing or malformed Authorization header.' });
    }

    const token = authHeader.split(' ')[1];
    const userId = verifySessionToken(token);

    if (!userId) {
      return res.status(401).json({ error: 'Session expired or invalid token.' });
    }

    const accounts: any[] = await prisma.$queryRaw`
      SELECT id, username, email, name
      FROM "AdminAccount"
      WHERE id = ${userId}
      LIMIT 1;
    `;

    if (accounts.length === 0) {
      return res.status(404).json({ error: 'User account not found.' });
    }

    const admin = accounts[0];
    return res.json({
      authenticated: true,
      user: {
        id: admin.id,
        username: admin.username,
        email: admin.email,
        name: admin.name,
        role: 'ADMIN',
      },
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}
