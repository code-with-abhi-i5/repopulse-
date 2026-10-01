// ============================================================
// RepoPulse Frontend — Unified API Client (Live Backend)
// ============================================================

import type { Repository, ActivityEvent, Contributor, Alert, PullRequest, Issue } from '../types';

const API_BASE = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? 'https://repopulse-api-v5tc.onrender.com/api/v1' : 'http://localhost:5000/api/v1');

async function safeFetch<T>(endpoint: string, options: RequestInit = {}, fallback: T): Promise<T> {
  try {
    const token = typeof window !== 'undefined' ? localStorage.getItem('repopulse_auth_token') : null;
    const authHeaders: Record<string, string> = {};
    if (token) {
      authHeaders['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders,
        ...(options.headers || {}),
      },
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }

    const json = await res.json();
    return (json.data !== undefined ? json.data : json) as T;
  } catch (err: any) {
    console.warn(`[RepoPulse API] Fetch failed for ${endpoint}:`, err.message);
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
      []
    );
  },

  async getRepositoryById(id: string, fresh: boolean = false): Promise<Repository | null> {
    const encodedId = encodeURIComponent(id);
    const repo = await safeFetch<any>(`/repositories/${encodedId}${fresh ? '?fresh=true' : ''}`, { method: 'GET' }, null);
    
    if (repo) {
      if (repo.commits && Array.isArray(repo.commits)) {
        repo.commits = repo.commits.map((c: any) => ({
          ...c,
          authorLogin: c.authorLogin || c.author?.login || 'unknown',
          author: {
            name: c.authorLogin || c.author?.name || 'Developer',
            avatarUrl: `https://github.com/${c.authorLogin || 'ghost'}.png`,
          },
        }));
      }
      if (repo.pullRequests && Array.isArray(repo.pullRequests)) {
        repo.pullRequests = repo.pullRequests.map((pr: any) => ({
          ...pr,
          authorLogin: pr.authorLogin || pr.author?.login || 'unknown',
          author: {
            name: pr.authorLogin || pr.author?.name || 'Developer',
            avatarUrl: `https://github.com/${pr.authorLogin || 'ghost'}.png`,
          },
        }));
      }
      if (repo.issues && Array.isArray(repo.issues)) {
        repo.issues = repo.issues.map((issue: any) => ({
          ...issue,
          authorLogin: issue.authorLogin || issue.author?.login || 'unknown',
          author: {
            name: issue.authorLogin || issue.author?.name || 'Developer',
            avatarUrl: `https://github.com/${issue.authorLogin || 'ghost'}.png`,
          },
        }));
      }
    }
    return repo;
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
      return { status: 'UNKNOWN', reasons: ['API audit connection failed'] };
    }
  },

  async syncRepository(fullName: string, teamName?: string, hackathonBatch?: string): Promise<any> {
    try {
      const res = await fetch(`${API_BASE}/repositories/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName, teamName, hackathonBatch }),
      });
      return await res.json();
    } catch (err: any) {
      return { error: err.message };
    }
  },

  async deleteRepository(id: string, adminKey: string = 'hackqubit-admin-secret-2026'): Promise<any> {
    const res = await fetch(`${API_BASE}/repositories/${id}`, {
      method: 'DELETE',
      headers: {
        'x-admin-key': adminKey,
      },
    });
    return await res.json();
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
  async getActivities(fresh: boolean = false): Promise<ActivityEvent[]> {
    const data = await safeFetch<any[]>(`/activities${fresh ? '?fresh=true' : ''}`, { method: 'GET' }, []);
    return data.map((evt: any) => {
      let cleanTitle = evt.title || evt.description || 'Activity recorded';
      if (cleanTitle.startsWith('New push to ')) {
        const colonIdx = cleanTitle.indexOf(': ');
        if (colonIdx !== -1) {
          cleanTitle = cleanTitle.substring(colonIdx + 2);
        }
      }

      const login = evt.actorLogin || 'contributor';
      return {
        ...evt,
        type: (evt.type || 'push').toLowerCase() as any,
        title: cleanTitle,
        description: evt.description || cleanTitle,
        commitCount: evt.commitCount || 1,
        actor: {
          login,
          name: evt.actorName || login,
          avatarUrl: evt.actorAvatarUrl || `https://github.com/${login}.png`,
        },
      };
    }) as ActivityEvent[];
  },

  // Contributors
  async getContributors(): Promise<Contributor[]> {
    const data = await safeFetch<any[]>('/contributors', { method: 'GET' }, []);
    return data.map((c: any) => ({
      ...c,
      commits: c.totalCommits || c.commits || 0,
    })) as Contributor[];
  },

  async getContributorByLogin(login: string, fresh: boolean = false): Promise<any> {
    return safeFetch<any>(`/contributors/${encodeURIComponent(login)}${fresh ? '?fresh=true' : ''}`, { method: 'GET' }, null);
  },

  // Pull Requests & Issues
  async getPullRequests(): Promise<PullRequest[]> {
    const prs = await safeFetch<any[]>('/pull-requests', { method: 'GET' }, []);
    return prs.map((pr: any) => ({
      ...pr,
      author: { name: pr.authorLogin, avatarUrl: `https://github.com/${pr.authorLogin}.png` }
    })) as PullRequest[];
  },

  async getIssues(): Promise<Issue[]> {
    const issues = await safeFetch<any[]>('/issues', { method: 'GET' }, []);
    return issues.map((issue: any) => ({
      ...issue,
      author: { name: issue.authorLogin, avatarUrl: `https://github.com/${issue.authorLogin}.png` }
    })) as Issue[];
  },

  // Alerts
  async getAlerts(): Promise<Alert[]> {
    return safeFetch<Alert[]>('/alerts', { method: 'GET' }, []);
  },

  // Authentication
  async login(username: string, password: string): Promise<{ success: boolean; token: string; user: any; message?: string }> {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.error || 'Login failed. Please check your credentials.');
    }
    return json;
  },

  async changePassword(username: string, currentPassword: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${API_BASE}/auth/change-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, currentPassword, newPassword }),
    });

    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.error || 'Failed to update password.');
    }
    return json;
  },

  async resetPassword(username: string, recoveryKey: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${API_BASE}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, recoveryKey, newPassword }),
    });

    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.error || 'Failed to reset password.');
    }
    return json;
  },

  async getMe(): Promise<any> {
    return safeFetch<any>('/auth/me', { method: 'GET' }, null);
  },

  // Analytics & Real Engineering Velocity
  async getAnalytics(days: number = 30): Promise<any> {
    return safeFetch<any>(`/analytics?days=${days}`, { method: 'GET' }, null);
  },

  // Executive Reports
  async getReports(): Promise<any[]> {
    const res = await safeFetch<any>('/reports', { method: 'GET' }, { data: [] });
    return res.data || (Array.isArray(res) ? res : []);
  },

  async generateReport(title?: string): Promise<any> {
    const token = typeof window !== 'undefined' ? localStorage.getItem('repopulse_auth_token') : null;
    const authHeaders: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};

    const res = await fetch(`${API_BASE}/reports/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders,
      },
      body: JSON.stringify({ title: title || 'Executive Fleet Intelligence Audit' }),
    });

    const json = await res.json();
    return json.data || json;
  },
};
