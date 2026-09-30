// ============================================================
// RepoPulse — Multi-Channel Alert & Notification Service
// ============================================================

import axios from 'axios';
import { prisma } from '../lib/prisma.js';
import { broadcastAlert } from '../lib/socket.js';
import { AlertChannel, AlertSeverity } from '@prisma/client';
import { ENV } from '../config/env.js';

// Simple in-memory throttle cache (ruleId -> timestamp)
const throttleCache = new Map<string, number>();

export async function evaluateAlertRules(
  repositoryId: string,
  eventType: string,
  eventContext: any
) {
  try {
    const rules = await prisma.alertRule.findMany({
      where: { repositoryId, state: 'ACTIVE' },
    });

    const now = Date.now();

    for (const rule of rules) {
      if (rule.event !== eventType && rule.event !== 'all') continue;

      // Throttle Check
      const lastTriggered = throttleCache.get(rule.id) || 0;
      const throttleMs = (rule.throttleMinutes || 15) * 60 * 1000;
      if (now - lastTriggered < throttleMs) {
        continue;
      }

      const message = `🚨 [${rule.severity}] ${rule.repositoryName}: ${eventContext.title || 'Event triggered'}`;

      // Dispatch alert
      await dispatchAlert(rule.channel, rule.webhookUrl, rule.destination, message);

      // Record throttle
      throttleCache.set(rule.id, now);

      // Save Alert in Database
      const alert = await prisma.alert.create({
        data: {
          ruleId: rule.id,
          repositoryId,
          type: eventType,
          severity: rule.severity,
          repository: rule.repositoryName,
          message,
          channel: rule.channel,
        },
      });

      // Broadcast to WebSocket UI
      broadcastAlert(alert);
    }
  } catch (err: any) {
    console.error(`❌ [AlertService] Error evaluating alert rules:`, err.message);
  }
}

export async function dispatchAlert(
  channel: AlertChannel,
  webhookUrl?: string | null,
  destination?: string | null,
  message?: string
) {
  if (!message) return;

  try {
    switch (channel) {
      case 'SLACK': {
        const target = webhookUrl || ENV.SLACK_WEBHOOK_URL;
        if (target) {
          await axios.post(target, { text: message });
          console.log(`📣 [Alert] Dispatched to Slack.`);
        }
        break;
      }
      case 'DISCORD': {
        const target = webhookUrl || ENV.DISCORD_WEBHOOK_URL;
        if (target) {
          await axios.post(target, { content: message });
          console.log(`📣 [Alert] Dispatched to Discord.`);
        }
        break;
      }
      case 'TELEGRAM': {
        const token = ENV.TELEGRAM_BOT_TOKEN;
        const chatId = destination;
        if (token && chatId) {
          await axios.post(`https://api.telegram.org/bot${token}/sendMessage`, {
            chat_id: chatId,
            text: message,
          });
          console.log(`📣 [Alert] Dispatched to Telegram.`);
        }
        break;
      }
      default:
        console.log(`📢 [Alert Notification]: ${message}`);
    }
  } catch (err: any) {
    console.warn(`⚠️ [Alert] Failed to dispatch alert via ${channel}: ${err.message}`);
  }
}
