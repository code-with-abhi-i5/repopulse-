// ============================================================
// RepoPulse — Redis Cache Keys & Centralized TTL Strategy
// ============================================================

import crypto from 'crypto';

/**
 * Long-Life Enterprise TTL Strategy (in seconds)
 * Data is held long-term (up to 2 days) and invalidated event-driven on new commits/webhooks
 */
export const CACHE_TTL = {
  // Repository details: 48 Hours (2 Days) — held until new push/webhook/delete occurs
  REPO_DETAIL: 48 * 60 * 60, // 172,800s
  // Repository lists & queries: 24 Hours (1 Day) — invalidated on new repo additions
  REPOS_LIST: 24 * 60 * 60, // 86,400s
  // Contributors Leaderboards: 24 Hours (1 Day)
  CONTRIBUTORS_LIST: 24 * 60 * 60, // 86,400s
  // Contributor profile details: 48 Hours (2 Days)
  CONTRIBUTOR_DETAIL: 48 * 60 * 60, // 172,800s
  // Health & Anti-Cheat scores: 12 Hours — recalculation buffer
  REPO_HEALTH: 12 * 60 * 60, // 43,200s
  // Activities stream: 10 Minutes (600s) — live telemetry buffer
  ACTIVITIES_LIST: 10 * 60, // 600s
  // Issues & Pull Requests: 12 Hours
  ISSUES_LIST: 12 * 60 * 60, // 43,200s
  PRS_LIST: 12 * 60 * 60, // 43,200s
  // Analytics & Reports
  ANALYTICS: 15 * 60, // 15 Minutes (900s)
  REPORTS: 30 * 60, // 30 Minutes (1800s)
  // System metadata: 24 Hours
  SYSTEM_META: 24 * 60 * 60, // 86,400s
} as const;

/**
 * Deterministic hash of object parameters to guarantee consistent cache keys
 * regardless of key ordering in query strings (e.g. ?page=1&limit=50 == ?limit=50&page=1)
 */
export function hashQueryParams(params: Record<string, any>): string {
  const sortedKeys = Object.keys(params)
    .filter((k) => params[k] !== undefined && params[k] !== '' && params[k] !== null)
    .sort();

  if (sortedKeys.length === 0) return 'default';

  const normalized = sortedKeys.map((k) => `${k}=${String(params[k]).trim()}`).join('&');
  return crypto.createHash('md5').update(normalized).digest('hex').substring(0, 12);
}

/**
 * Centralized, versioned Cache Key Factory
 * Format: repopulse:v1:{resource}:{identifier}
 */
export const cacheKeys = {
  // Repository keys
  reposList: (params: Record<string, any>) => `repos:list:${hashQueryParams(params)}`,
  repoDetail: (idOrFullName: string) => `repo:detail:${idOrFullName.toLowerCase().trim()}`,
  repoHealth: (idOrFullName: string) => `repo:health:${idOrFullName.toLowerCase().trim()}`,

  // Contributor keys
  contributorsList: (params: Record<string, any>) => `contributors:list:${hashQueryParams(params)}`,
  contributorDetail: (login: string) => `contributor:detail:${login.toLowerCase().trim()}`,

  // Activity stream keys
  activitiesList: (params: Record<string, any>) => `activities:list:${hashQueryParams(params)}`,

  // Issues & PRs
  issuesList: (params: Record<string, any>) => `issues:list:${hashQueryParams(params)}`,
  prsList: (params: Record<string, any>) => `prs:list:${hashQueryParams(params)}`,

  // Analytics & Reports
  analytics: (days: number) => `analytics:days:${days}`,
  reportsList: () => 'reports:list:all',

  // Invalidation pattern helpers
  patterns: {
    allRepos: 'repos:*',
    allRepoLists: 'repos:list:*',
    singleRepo: (id: string, fullName?: string) => [
      `repo:detail:${id.toLowerCase().trim()}`,
      `repo:health:${id.toLowerCase().trim()}`,
      ...(fullName ? [
        `repo:detail:${fullName.toLowerCase().trim()}`,
        `repo:health:${fullName.toLowerCase().trim()}`
      ] : []),
    ],
    allContributors: 'contributor*',
    allActivities: 'activities:*',
    allIssues: 'issues:*',
    allPrs: 'prs:*',
    allAnalytics: 'analytics:*',
    allReports: 'reports:*',
  },
};
