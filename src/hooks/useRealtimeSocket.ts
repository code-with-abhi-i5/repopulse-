// ============================================================
// RepoPulse Frontend — Real-Time WebSocket Hook
// ============================================================

import { useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { useRealtimeStore, useNotificationStore, useRepositoryStore } from '../stores';
import type { ActivityEvent } from '../types';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

let socket: Socket | null = null;

export function useRealtimeSocket() {
  const setConnectionStatus = useRealtimeStore((s) => s.setConnectionStatus);
  const addLiveEvent = useRealtimeStore((s) => s.addLiveEvent);
  const addNotification = useNotificationStore((s) => s.addNotification);

  useEffect(() => {
    try {
      if (!socket) {
        socket = io(SOCKET_URL, {
          transports: ['websocket', 'polling'],
          reconnectionAttempts: 3,
          reconnectionDelay: 3000,
          timeout: 4000,
        });

        socket.on('connect', () => {
          console.log('⚡ [Frontend Socket] Connected to RepoPulse Live Engine!');
          setConnectionStatus('live');
        });

        socket.on('disconnect', () => {
          console.log('🔌 [Frontend Socket] Disconnected from Live Engine.');
          setConnectionStatus('demo');
        });

        socket.on('connect_error', () => {
          setConnectionStatus('demo');
        });

      // Listen for new live activities (pushes, PRs, workflow runs)
      socket.on('activity:new', (event: any) => {
        const mappedEvent = {
          ...event,
          actor: {
            login: event.actorLogin,
            name: event.actorName || event.actorLogin,
            avatarUrl: event.actorAvatarUrl,
          },
        };
        addLiveEvent(mappedEvent as ActivityEvent);
        addNotification({
          id: `notif-${Date.now()}`,
          severity: 'info',
          title: event.title,
          description: event.description || `Activity on ${event.repositoryName}`,
          timestamp: new Date().toISOString(),
          read: false,
          repositoryName: event.repositoryName,
        });
      });

      // Listen for real-time health score updates
      socket.on('health:updated', ({ repositoryId, healthScore }) => {
        const { repositories, setRepositories } = useRepositoryStore.getState();
        const updated = repositories.map((r) =>
          r.id === repositoryId ? { ...r, healthScore } : r
        );
        setRepositories(updated);
      });

      // Listen for anti-cheat verification status changes
      socket.on('anticheat:status', ({ repositoryId, status, summary }) => {
        const { repositories, setRepositories } = useRepositoryStore.getState();
        const updated = repositories.map((r) =>
          r.id === repositoryId ? { ...r, antiCheatStatus: status } : r
        );
        setRepositories(updated);

        if (status === 'PRE_EXISTING_FLAG') {
          addNotification({
            id: `flag-${Date.now()}`,
            severity: 'critical',
            title: 'Anti-Cheat Flag Triggered',
            description: summary || `Pre-existing commits detected on repo ${repositoryId}`,
            timestamp: new Date().toISOString(),
            read: false,
          });
        }
      });

      // Listen for critical alerts
      socket.on('alert:triggered', (alert: any) => {
        addNotification({
          id: alert.id || `alert-${Date.now()}`,
          severity: alert.severity?.toLowerCase() || 'warning',
          title: alert.type || 'System Alert',
          description: alert.message,
          timestamp: new Date().toISOString(),
          read: false,
          repositoryName: alert.repository,
        });
      });
      }
    } catch (e) {
      console.warn('[Socket] Socket initialization error (falling back to offline):', e);
    }

    return () => {
      // Keep persistent across page navigation
    };
  }, [setConnectionStatus, addLiveEvent, addNotification]);
}
