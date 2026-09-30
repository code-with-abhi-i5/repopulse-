import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

export const ENV = {
  PORT: parseInt(process.env.PORT || '5000', 10),
  NODE_ENV: process.env.NODE_ENV || 'development',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
  DATABASE_URL: process.env.DATABASE_URL || '',
  DIRECT_URL: process.env.DIRECT_URL || '',
  REDIS_URL: process.env.REDIS_URL || 'redis://localhost:6379',
  ADMIN_API_KEY: process.env.ADMIN_API_KEY || 'hackqubit-admin-secret-2026',
  GITHUB_TOKEN_POOL: process.env.GITHUB_TOKEN_POOL || '',
  GITHUB_WEBHOOK_SECRET: process.env.GITHUB_WEBHOOK_SECRET || 'repopulse_webhook_secret_key',
  SLACK_WEBHOOK_URL: process.env.SLACK_WEBHOOK_URL || '',
  DISCORD_WEBHOOK_URL: process.env.DISCORD_WEBHOOK_URL || '',
  TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN || '',
  ADMIN_EMAIL: process.env.ADMIN_EMAIL || 'admin@repopulse.io',
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || '',
};
