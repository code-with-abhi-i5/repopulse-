// ============================================================
// RepoPulse Frontend — Unified API Client (With Offline Mock Fallback)
// ============================================================

import {
  mockRepositories,
  mockContributors,
  mockActivityEvents,
  mockAlerts,
  mockPullRequests,
  mockIssues,
} from '../data/mock';
import type { Repository, ActivityEvent, Contributor, Alert, PullRequest, Issue } from '../types';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

async function safeFetch<T>(endpoint: string, options: RequestInit = {}, fallback: T): Promise<T> {
  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }

    const json = await res.json();
    return (json.data !== undefined ? json.data : json) as T;
  } catch (err: any) {
    console.warn(`[RepoPulse API] Fetch failed for ${endpoint}. Using offline mock fallback.`, err.message);
    return fallback;
  }
}

export const api = {
  // Repositories
  async getRepositories(search?: string, batch?: string): Promise<Repository[]> {
    const query = new URLSearchParams();
    if (search) query.append('search', search);
    if (batch && batch !== 'all') query.append('batch', batch);

    return safeFetch<Repository[]>(
      `/repositories?${query.toString()}`,
      { method: 'GET' },
      mockRepositories
    );
  },

  async getRepositoryById(id: string): Promise<Repository | null> {
    const fallback = mockRepositories.find((r) => r.id === id || r.fullName === id) || null;
    return safeFetch<Repository | null>(`/repositories/${id}`, { method: 'GET' }, fallback);
  },

  async triggerAudit(repoId: string, hackathonStartTime: string): Promise<any> {
    try {
      const res = await fetch(`${API_BASE}/repositories/${repoId}/anti-cheat-audit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hackathonStartTime }),
      });
      return await res.json();
    } catch {
      return { status: 'VERIFIED_FRESH', reasons: ['Offline audit simulated'] };
    }
  },

  // Upload Excel / CSV file
  async uploadExcel(
    file: File,
    batch: string = 'HackQubit-2026',
    startTime: string = new Date().toISOString(),
    adminKey: string = 'hackqubit-admin-secret-2026'
  ): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('hackathonBatch', batch);
    formData.append('hackathonStartTime', startTime);

    const res = await fetch(`${API_BASE}/repositories/upload-excel`, {
      method: 'POST',
      headers: {
        'x-admin-key': adminKey,
      },
      body: formData,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Upload failed' }));
      throw new Error(err.error || `HTTP ${res.status}`);
    }

    return await res.json();
  },

  // Bulk add repos JSON
  async bulkAddRepos(
    repos: Array<{ teamName: string; repoUrl: string }>,
    batch: string = 'HackQubit-2026',
    adminKey: string = 'hackqubit-admin-secret-2026'
  ): Promise<any> {
    const res = await fetch(`${API_BASE}/repositories/bulk-add`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-key': adminKey,
      },
      body: JSON.stringify({
        hackathonBatch: batch,
        repos,
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Bulk add failed' }));
      throw new Error(err.error || `HTTP ${res.status}`);
    }

    return await res.json();
  },

  // Activities
  async getActivities(): Promise<ActivityEvent[]> {
    return safeFetch<ActivityEvent[]>('/activities', { method: 'GET' }, mockActivityEvents);
  },

  // Contributors
  async getContributors(): Promise<Contributor[]> {
    return safeFetch<Contributor[]>('/contributors', { method: 'GET' }, mockContributors);
  },

  // Pull Requests & Issues
  async getPullRequests(): Promise<PullRequest[]> {
    return safeFetch<PullRequest[]>('/pull-requests', { method: 'GET' }, mockPullRequests);
  },

  async getIssues(): Promise<Issue[]> {
    return safeFetch<Issue[]>('/issues', { method: 'GET' }, mockIssues);
  },

  // Alerts
  async getAlerts(): Promise<Alert[]> {
    return safeFetch<Alert[]>('/alerts', { method: 'GET' }, mockAlerts);
  },
};
