// ============================================================
// RepoPulse — Zustand Stores
// ============================================================

import { create } from 'zustand';
import type { ConnectionStatus, Repository, Notification, ActivityEvent } from '../types';

// --- UI Store ---
interface UIState {
  sidebarCollapsed: boolean;
  sidebarMobileOpen: boolean;
  theme: 'dark' | 'light' | 'system';
  commandPaletteOpen: boolean;
  notificationDrawerOpen: boolean;
  toggleSidebar: () => void;
  setSidebarMobileOpen: (open: boolean) => void;
  setTheme: (theme: 'dark' | 'light' | 'system') => void;
  setCommandPaletteOpen: (open: boolean) => void;
  setNotificationDrawerOpen: (open: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarCollapsed: false,
  sidebarMobileOpen: false,
  theme: 'dark',
  commandPaletteOpen: false,
  notificationDrawerOpen: false,
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  setSidebarMobileOpen: (open) => set({ sidebarMobileOpen: open }),
  setTheme: (theme) => set({ theme }),
  setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),
  setNotificationDrawerOpen: (open) => set({ notificationDrawerOpen: open }),
}));

// --- Repository Store ---
interface RepositoryState {
  selectedRepositoryId: string | null;
  repositories: Repository[];
  setSelectedRepositoryId: (id: string | null) => void;
  setRepositories: (repos: Repository[]) => void;
}

export const useRepositoryStore = create<RepositoryState>((set) => ({
  selectedRepositoryId: null,
  repositories: [],
  setSelectedRepositoryId: (id) => set({ selectedRepositoryId: id }),
  setRepositories: (repos) => set({ repositories: repos }),
}));

// --- Demo Store ---
interface DemoState {
  isDemoMode: boolean;
  isSimulationRunning: boolean;
  setDemoMode: (on: boolean) => void;
  setSimulationRunning: (running: boolean) => void;
}

export const useDemoStore = create<DemoState>((set) => ({
  isDemoMode: false,
  isSimulationRunning: false,
  setDemoMode: (on) => set({ isDemoMode: on }),
  setSimulationRunning: (running) => set({ isSimulationRunning: running }),
}));

// --- Notification Store ---
interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Notification) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  setNotifications: (notifications: Notification[]) => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],
  unreadCount: 0,
  addNotification: (notification) =>
    set((s) => ({
      notifications: [notification, ...s.notifications].slice(0, 50),
      unreadCount: s.unreadCount + 1,
    })),
  markAsRead: (id) =>
    set((s) => ({
      notifications: s.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      ),
      unreadCount: Math.max(0, s.unreadCount - 1),
    })),
  markAllAsRead: () =>
    set((s) => ({
      notifications: s.notifications.map((n) => ({ ...n, read: true })),
      unreadCount: 0,
    })),
  setNotifications: (notifications) =>
    set({
      notifications,
      unreadCount: notifications.filter((n) => !n.read).length,
    }),
}));

// --- Realtime Store ---
interface RealtimeState {
  connectionStatus: ConnectionStatus;
  liveEvents: ActivityEvent[];
  setConnectionStatus: (status: ConnectionStatus) => void;
  addLiveEvent: (event: ActivityEvent) => void;
  setLiveEvents: (events: ActivityEvent[]) => void;
}

export const useRealtimeStore = create<RealtimeState>((set) => ({
  connectionStatus: 'demo',
  liveEvents: [],
  setConnectionStatus: (status) => set({ connectionStatus: status }),
  addLiveEvent: (event) =>
    set((s) => ({
      liveEvents: [event, ...s.liveEvents].slice(0, 100),
    })),
  setLiveEvents: (events) => set({ liveEvents: events }),
}));

// --- Auth Store ---
export interface AuthUser {
  id: string;
  username: string;
  email: string;
  name: string;
  role: string;
}

interface AuthState {
  isAuthenticated: boolean;
  token: string | null;
  user: AuthUser | null;
  login: (token: string, user: AuthUser) => void;
  logout: () => void;
  updateUser: (user: Partial<AuthUser>) => void;
}

const savedToken = typeof window !== 'undefined' ? localStorage.getItem('repopulse_auth_token') : null;
const savedUserStr = typeof window !== 'undefined' ? localStorage.getItem('repopulse_auth_user') : null;
let parsedUser: AuthUser | null = null;
if (savedUserStr) {
  try {
    parsedUser = JSON.parse(savedUserStr);
  } catch {}
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: !!savedToken,
  token: savedToken,
  user: parsedUser,
  login: (token, user) => {
    localStorage.setItem('repopulse_auth_token', token);
    localStorage.setItem('repopulse_auth_user', JSON.stringify(user));
    set({ isAuthenticated: true, token, user });
  },
  logout: () => {
    localStorage.removeItem('repopulse_auth_token');
    localStorage.removeItem('repopulse_auth_user');
    set({ isAuthenticated: false, token: null, user: null });
  },
  updateUser: (userUpdates) =>
    set((s) => {
      const updated = s.user ? { ...s.user, ...userUpdates } : null;
      if (updated) {
        localStorage.setItem('repopulse_auth_user', JSON.stringify(updated));
      }
      return { user: updated };
    }),
}));
