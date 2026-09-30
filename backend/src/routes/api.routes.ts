// ============================================================
// RepoPulse — Main API Router
// ============================================================

import { Router } from 'express';
import multer from 'multer';
import {
  getRepositories,
  getRepositoryById,
  getRepositoryHealth,
  runAuditEndpoint,
  syncSingleRepoEndpoint,
  deleteRepository,
} from '../controllers/repo.controller.js';
import { uploadExcelHandler, bulkAddHandler } from '../controllers/excel.controller.js';
import { getActivities } from '../controllers/activity.controller.js';
import { getContributors, getContributorByLogin } from '../controllers/contributor.controller.js';
import { getPullRequests } from '../controllers/pr.controller.js';
import { getIssues } from '../controllers/issue.controller.js';
import { getAlerts, markAlertAsRead, getAlertRules, createAlertRule } from '../controllers/alert.controller.js';
import { handleGitHubWebhook } from '../controllers/webhook.controller.js';
import { requireAdminKey } from '../middlewares/auth.middleware.js';
import { login, changePassword, resetPassword, getMe } from '../controllers/auth.controller.js';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB
});

export const apiRouter = Router();

// -------------------------------------------------------------
// Authentication Endpoints
// -------------------------------------------------------------
apiRouter.post('/auth/login', login);
apiRouter.post('/auth/change-password', changePassword);
apiRouter.post('/auth/reset-password', resetPassword);
apiRouter.get('/auth/me', getMe);

// -------------------------------------------------------------
// Health Check
// -------------------------------------------------------------
apiRouter.get('/health', (req, res) => {
  res.json({
    status: 'online',
    platform: 'RepoPulse API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// -------------------------------------------------------------
// Repositories & Bulk Excel Ingestion
// -------------------------------------------------------------
apiRouter.get('/repositories', getRepositories);
apiRouter.get('/repositories/:id', getRepositoryById);
apiRouter.get('/repositories/:id/health', getRepositoryHealth);
apiRouter.post('/repositories/:id/anti-cheat-audit', runAuditEndpoint);
apiRouter.post('/repositories/sync', syncSingleRepoEndpoint);

// Organizer / Admin Mutations (Protected by requireAdminKey)
apiRouter.post('/repositories/upload-excel', requireAdminKey, upload.single('file'), uploadExcelHandler);
apiRouter.post('/repositories/bulk-add', requireAdminKey, bulkAddHandler);
apiRouter.delete('/repositories/:id', requireAdminKey, deleteRepository);

// -------------------------------------------------------------
// Activities & Streams
// -------------------------------------------------------------
apiRouter.get('/activities', getActivities);

// -------------------------------------------------------------
// Contributors & Leaderboards
// -------------------------------------------------------------
apiRouter.get('/contributors', getContributors);
apiRouter.get('/contributors/:login', getContributorByLogin);

// -------------------------------------------------------------
// Pull Requests & Issues
// -------------------------------------------------------------
apiRouter.get('/pull-requests', getPullRequests);
apiRouter.get('/issues', getIssues);

// -------------------------------------------------------------
// Alerts & Automated Notifications
// -------------------------------------------------------------
apiRouter.get('/alerts', getAlerts);
apiRouter.patch('/alerts/:id/read', markAlertAsRead);
apiRouter.get('/alerts/rules', getAlertRules);
apiRouter.post('/alerts/rules', createAlertRule);

// -------------------------------------------------------------
// GitHub Webhook Ingest
// -------------------------------------------------------------
apiRouter.post('/webhooks/github', handleGitHubWebhook);
