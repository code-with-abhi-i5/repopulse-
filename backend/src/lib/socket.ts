// ============================================================
// RepoPulse — Real-Time WebSocket Engine (Socket.io)
// ============================================================

import { Server as HttpServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { ENV } from '../config/env.js';

let io: SocketIOServer | null = null;

export function initSocketServer(server: HttpServer): SocketIOServer {
  io = new SocketIOServer(server, {
    cors: {
      origin: '*', // Allows frontend on any port
      methods: ['GET', 'POST'],
    },
    transports: ['websocket', 'polling'],
  });

  io.on('connection', (socket) => {
    console.log(`⚡ [WebSocket] Client connected: ${socket.id}`);

    // Join room for specific repository
    socket.on('subscribe:repo', ({ repoId }) => {
      if (repoId) {
        socket.join(`repo:${repoId}`);
        console.log(`📌 Client ${socket.id} subscribed to repo:${repoId}`);
      }
    });

    socket.on('unsubscribe:repo', ({ repoId }) => {
      if (repoId) {
        socket.leave(`repo:${repoId}`);
        console.log(`👋 Client ${socket.id} unsubscribed from repo:${repoId}`);
      }
    });

    // Join room for specific team
    socket.on('subscribe:team', ({ teamId }) => {
      if (teamId) {
        socket.join(`team:${teamId}`);
      }
    });

    socket.on('disconnect', () => {
      console.log(`🔌 [WebSocket] Client disconnected: ${socket.id}`);
    });
  });

  return io;
}

export function getIO(): SocketIOServer | null {
  return io;
}

export function broadcastActivityEvent(activity: any) {
  if (!io) return;
  io.emit('activity:new', activity);
  if (activity.repositoryId) {
    io.to(`repo:${activity.repositoryId}`).emit('activity:new', activity);
  }
}

export function broadcastHealthUpdate(repositoryId: string, healthScore: number, breakdown?: any) {
  if (!io) return;
  const payload = { repositoryId, healthScore, breakdown, timestamp: new Date().toISOString() };
  io.emit('health:updated', payload);
  io.to(`repo:${repositoryId}`).emit('health:updated', payload);
}

export function broadcastAlert(alert: any) {
  if (!io) return;
  io.emit('alert:triggered', alert);
  if (alert.repositoryId) {
    io.to(`repo:${alert.repositoryId}`).emit('alert:triggered', alert);
  }
}

export function broadcastAntiCheatStatus(repositoryId: string, status: string, summary?: string) {
  if (!io) return;
  const payload = { repositoryId, status, summary, timestamp: new Date().toISOString() };
  io.emit('anticheat:status', payload);
  io.to(`repo:${repositoryId}`).emit('anticheat:status', payload);
}
