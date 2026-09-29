// ============================================================
// RepoPulse — Mock Data: Repositories, Contributors, Commits
// ============================================================

import type {
  Repository,
  Contributor,
  Commit,
  PullRequest,
  Issue,
  AlertRule,
  Alert,
  ActivityEvent,
  HealthScore,
  RepositorySnapshot,
  WorkflowRun,
  Notification,
  Report,
  ContributorRef,
  Label,
} from '../../types';

// ---- Contributors ----
const contributorRefs: ContributorRef[] = [
  { login: 'abhi', name: 'Abhi Ghosh', avatarUrl: 'https://api.dicebear.com/9.x/avataaars/svg?seed=abhi' },
  { login: 'priya', name: 'Priya Sharma', avatarUrl: 'https://api.dicebear.com/9.x/avataaars/svg?seed=priya' },
  { login: 'rahul', name: 'Rahul Kumar', avatarUrl: 'https://api.dicebear.com/9.x/avataaars/svg?seed=rahul' },
  { login: 'sneha', name: 'Sneha Patel', avatarUrl: 'https://api.dicebear.com/9.x/avataaars/svg?seed=sneha' },
  { login: 'arjun', name: 'Arjun Singh', avatarUrl: 'https://api.dicebear.com/9.x/avataaars/svg?seed=arjun' },
  { login: 'meera', name: 'Meera Nair', avatarUrl: 'https://api.dicebear.com/9.x/avataaars/svg?seed=meera' },
  { login: 'vikram', name: 'Vikram Das', avatarUrl: 'https://api.dicebear.com/9.x/avataaars/svg?seed=vikram' },
  { login: 'ananya', name: 'Ananya Roy', avatarUrl: 'https://api.dicebear.com/9.x/avataaars/svg?seed=ananya' },
  { login: 'karthik', name: 'Karthik V', avatarUrl: 'https://api.dicebear.com/9.x/avataaars/svg?seed=karthik' },
  { login: 'divya', name: 'Divya Menon', avatarUrl: 'https://api.dicebear.com/9.x/avataaars/svg?seed=divya' },
];

export const mockContributors: Contributor[] = [
  { id: 'user-001', login: 'abhi', name: 'Abhi Ghosh', avatarUrl: contributorRefs[0].avatarUrl, commits: 142, additions: 3821, deletions: 842, activeDays: 26, firstCommitAt: '2025-01-14T10:00:00Z', lastCommitAt: '2026-09-29T15:40:00Z', currentStreak: 12, longestStreak: 34, isBot: false, repositories: ['repo-001', 'repo-002', 'repo-004'] },
  { id: 'user-002', login: 'priya', name: 'Priya Sharma', avatarUrl: contributorRefs[1].avatarUrl, commits: 98, additions: 2102, deletions: 421, activeDays: 21, firstCommitAt: '2025-02-08T14:00:00Z', lastCommitAt: '2026-09-29T12:10:00Z', currentStreak: 8, longestStreak: 22, isBot: false, repositories: ['repo-001', 'repo-003'] },
  { id: 'user-003', login: 'rahul', name: 'Rahul Kumar', avatarUrl: contributorRefs[2].avatarUrl, commits: 74, additions: 1830, deletions: 612, activeDays: 19, firstCommitAt: '2025-03-15T09:00:00Z', lastCommitAt: '2026-09-28T18:30:00Z', currentStreak: 5, longestStreak: 18, isBot: false, repositories: ['repo-002', 'repo-005'] },
  { id: 'user-004', login: 'sneha', name: 'Sneha Patel', avatarUrl: contributorRefs[3].avatarUrl, commits: 63, additions: 1540, deletions: 380, activeDays: 17, firstCommitAt: '2025-04-02T11:00:00Z', lastCommitAt: '2026-09-29T09:20:00Z', currentStreak: 3, longestStreak: 15, isBot: false, repositories: ['repo-001', 'repo-004'] },
  { id: 'user-005', login: 'arjun', name: 'Arjun Singh', avatarUrl: contributorRefs[4].avatarUrl, commits: 52, additions: 1220, deletions: 290, activeDays: 14, firstCommitAt: '2025-05-10T08:00:00Z', lastCommitAt: '2026-09-27T14:45:00Z', currentStreak: 2, longestStreak: 11, isBot: false, repositories: ['repo-003', 'repo-006'] },
  { id: 'user-006', login: 'meera', name: 'Meera Nair', avatarUrl: contributorRefs[5].avatarUrl, commits: 45, additions: 980, deletions: 210, activeDays: 12, firstCommitAt: '2025-06-20T13:00:00Z', lastCommitAt: '2026-09-26T16:00:00Z', currentStreak: 1, longestStreak: 9, isBot: false, repositories: ['repo-002'] },
  { id: 'user-007', login: 'vikram', name: 'Vikram Das', avatarUrl: contributorRefs[6].avatarUrl, commits: 38, additions: 740, deletions: 180, activeDays: 10, firstCommitAt: '2025-07-05T10:00:00Z', lastCommitAt: '2026-09-25T11:30:00Z', currentStreak: 0, longestStreak: 7, isBot: false, repositories: ['repo-005'] },
  { id: 'user-008', login: 'ananya', name: 'Ananya Roy', avatarUrl: contributorRefs[7].avatarUrl, commits: 31, additions: 620, deletions: 140, activeDays: 8, firstCommitAt: '2025-08-12T15:00:00Z', lastCommitAt: '2026-09-24T09:00:00Z', currentStreak: 0, longestStreak: 6, isBot: false, repositories: ['repo-004', 'repo-006'] },
  { id: 'user-009', login: 'karthik', name: 'Karthik V', avatarUrl: contributorRefs[8].avatarUrl, commits: 24, additions: 480, deletions: 110, activeDays: 6, firstCommitAt: '2025-09-01T12:00:00Z', lastCommitAt: '2026-09-22T17:00:00Z', currentStreak: 0, longestStreak: 5, isBot: false, repositories: ['repo-003'] },
  { id: 'user-010', login: 'divya', name: 'Divya Menon', avatarUrl: contributorRefs[9].avatarUrl, commits: 18, additions: 340, deletions: 80, activeDays: 5, firstCommitAt: '2025-10-15T14:00:00Z', lastCommitAt: '2026-09-20T10:00:00Z', currentStreak: 0, longestStreak: 4, isBot: false, repositories: ['repo-001'] },
];

// ---- Repositories ----
export const mockRepositories: Repository[] = [
  { id: 'repo-001', githubId: 90123456, name: 'the-grocery-hub', fullName: 'Zectral/the-grocery-hub', owner: 'Zectral', description: 'Modern grocery commerce platform with real-time inventory tracking', visibility: 'public', defaultBranch: 'main', license: 'MIT', language: 'TypeScript', createdAt: '2025-01-12T09:30:00Z', updatedAt: '2026-09-29T16:10:00Z', pushedAt: '2026-09-29T16:10:00Z', stars: 1248, forks: 183, watchers: 97, openIssues: 12, sizeKb: 24800, archived: false, topics: ['grocery', 'ecommerce', 'typescript', 'react'], healthScore: 92 },
  { id: 'repo-002', githubId: 90123457, name: 'agentic-ai-platform', fullName: 'Zectral/agentic-ai-platform', owner: 'Zectral', description: 'Enterprise AI agent orchestration and deployment framework', visibility: 'public', defaultBranch: 'main', license: 'Apache-2.0', language: 'Python', createdAt: '2025-03-22T14:00:00Z', updatedAt: '2026-09-29T14:30:00Z', pushedAt: '2026-09-29T14:30:00Z', stars: 2341, forks: 412, watchers: 156, openIssues: 8, sizeKb: 18200, archived: false, topics: ['ai', 'agents', 'llm', 'python'], healthScore: 88 },
  { id: 'repo-003', githubId: 90123458, name: 'canopi', fullName: 'Zectral/canopi', owner: 'Zectral', description: 'Cloud-native application platform for modern infrastructure', visibility: 'public', defaultBranch: 'main', license: 'MIT', language: 'Go', createdAt: '2025-06-15T10:00:00Z', updatedAt: '2026-09-29T11:20:00Z', pushedAt: '2026-09-29T11:20:00Z', stars: 876, forks: 124, watchers: 63, openIssues: 5, sizeKb: 12400, archived: false, topics: ['cloud', 'infrastructure', 'golang', 'kubernetes'], healthScore: 79 },
  { id: 'repo-004', githubId: 90123459, name: 'repopulse', fullName: 'Zectral/repopulse', owner: 'Zectral', description: 'GitHub repository intelligence and monitoring platform', visibility: 'public', defaultBranch: 'main', license: 'MIT', language: 'TypeScript', createdAt: '2026-01-10T08:00:00Z', updatedAt: '2026-09-29T16:45:00Z', pushedAt: '2026-09-29T16:45:00Z', stars: 467, forks: 52, watchers: 38, openIssues: 4, sizeKb: 8600, archived: false, topics: ['github', 'analytics', 'monitoring', 'dashboard'], healthScore: 95 },
  { id: 'repo-005', githubId: 90123460, name: 'hackathon-platform', fullName: 'RVSCET/hackathon-platform', owner: 'RVSCET', description: 'All-in-one hackathon management and judging platform', visibility: 'public', defaultBranch: 'main', license: 'MIT', language: 'JavaScript', createdAt: '2025-09-01T12:00:00Z', updatedAt: '2026-09-28T09:00:00Z', pushedAt: '2026-09-28T09:00:00Z', stars: 234, forks: 67, watchers: 28, openIssues: 3, sizeKb: 6200, archived: false, topics: ['hackathon', 'events', 'judging'], healthScore: 71 },
  { id: 'repo-006', githubId: 90123461, name: 'community-dashboard', fullName: 'open-source/community-dashboard', owner: 'open-source', description: 'Open-source community analytics and engagement dashboard', visibility: 'public', defaultBranch: 'main', license: 'MIT', language: 'TypeScript', createdAt: '2025-11-20T16:00:00Z', updatedAt: '2026-09-27T14:00:00Z', pushedAt: '2026-09-27T14:00:00Z', stars: 156, forks: 34, watchers: 19, openIssues: 2, sizeKb: 4800, archived: false, topics: ['community', 'analytics', 'open-source'], healthScore: 64 },
];

// ---- Health Scores ----
export const mockHealthScores: Record<string, HealthScore> = {
  'repo-001': { total: 92, activity: 23, responsiveness: 17, ciHealth: 18, busFactor: 13, community: 9, security: 9, tips: ['All health metrics are looking great', 'Consider adding more community documentation'] },
  'repo-002': { total: 88, activity: 22, responsiveness: 16, ciHealth: 17, busFactor: 12, community: 9, security: 9, tips: ['Strong activity and CI health', 'Bus factor could be improved with more contributors'] },
  'repo-003': { total: 79, activity: 20, responsiveness: 14, ciHealth: 16, busFactor: 11, community: 8, security: 8, tips: ['Good overall health', 'Response times to issues could improve'] },
  'repo-004': { total: 95, activity: 24, responsiveness: 19, ciHealth: 19, busFactor: 14, community: 10, security: 9, tips: ['Excellent health across all metrics', 'Keep maintaining this momentum'] },
  'repo-005': { total: 71, activity: 18, responsiveness: 12, ciHealth: 14, busFactor: 10, community: 8, security: 7, tips: ['Activity is lower than baseline', 'Several stale issues need attention', 'Security scans should be reviewed'] },
  'repo-006': { total: 64, activity: 15, responsiveness: 11, ciHealth: 13, busFactor: 9, community: 7, security: 7, tips: ['Needs more active contributors', 'CI pipeline has recent failures', 'Consider adding security scanning'] },
};

// ---- Commits ----
const commitMessages = [
  'feat: add repository health analytics dashboard',
  'fix: resolve websocket reconnect issue on network change',
  'refactor: simplify contributor aggregation pipeline',
  'perf: reduce dashboard query latency by 40%',
  'docs: update API integration guide with examples',
  'feat: add alert rule builder with multi-step wizard',
  'fix: handle missing GitHub license metadata gracefully',
  'chore: update dependencies to latest stable versions',
  'feat: implement contribution heatmap with yearly view',
  'fix: correct timezone handling in commit timestamps',
  'feat: add real-time event streaming architecture',
  'refactor: migrate state management to Zustand',
  'fix: resolve memory leak in chart rendering',
  'feat: implement PR review latency analytics',
  'chore: configure CI pipeline for automated testing',
  'feat: add repository comparison side-by-side view',
  'fix: handle rate limit errors with exponential backoff',
  'feat: implement contributor profile drawer',
  'perf: optimize large dataset rendering with virtualization',
  'feat: add dark mode with system preference detection',
  'fix: resolve stale data in notification center',
  'feat: implement GitHub OAuth login flow',
  'refactor: extract chart components into reusable library',
  'fix: handle edge case in health score calculation',
  'feat: add weekly intelligence report generation',
  'chore: add pre-commit hooks for lint and typecheck',
  'feat: implement command palette with fuzzy search',
  'fix: resolve layout shift on dashboard load',
  'feat: add repository import with backfill progress',
  'perf: implement route-level code splitting',
];

function generateSHA(): string {
  return Array.from({ length: 7 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
}

export const mockCommits: Commit[] = commitMessages.map((message, i) => {
  const author = contributorRefs[i % contributorRefs.length];
  const daysAgo = i * 2;
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  date.setHours(9 + (i % 10), (i * 17) % 60);

  return {
    id: `commit-${String(i + 1).padStart(3, '0')}`,
    sha: generateSHA(),
    message,
    author,
    committer: author,
    branch: i % 5 === 0 ? 'develop' : 'main',
    repositoryId: mockRepositories[i % mockRepositories.length].id,
    timestamp: date.toISOString(),
    additions: 50 + Math.floor(Math.random() * 800),
    deletions: 10 + Math.floor(Math.random() * 200),
    filesChanged: 1 + Math.floor(Math.random() * 20),
    files: [
      { filename: `src/components/${message.split(':')[1]?.trim().split(' ').slice(0, 2).join('')}.tsx`, status: 'modified' as const, additions: 30 + Math.floor(Math.random() * 100), deletions: 5 + Math.floor(Math.random() * 50) },
    ],
    url: `https://github.com/${mockRepositories[i % mockRepositories.length].fullName}/commit/${generateSHA()}`,
  };
});

// ---- Labels ----
const prLabels: Label[] = [
  { name: 'feature', color: '#a855f7' },
  { name: 'bug', color: '#ef4444' },
  { name: 'enhancement', color: '#3b82f6' },
  { name: 'documentation', color: '#06b6d4' },
  { name: 'refactor', color: '#f59e0b' },
  { name: 'performance', color: '#10b981' },
  { name: 'security', color: '#dc2626' },
  { name: 'dependencies', color: '#6366f1' },
];

const issueLabels: Label[] = [
  { name: 'bug', color: '#ef4444' },
  { name: 'enhancement', color: '#3b82f6' },
  { name: 'help wanted', color: '#10b981' },
  { name: 'good first issue', color: '#8b5cf6' },
  { name: 'performance', color: '#f59e0b' },
  { name: 'question', color: '#06b6d4' },
  { name: 'wontfix', color: '#6b7280' },
  { name: 'duplicate', color: '#9ca3af' },
  { name: 'critical', color: '#dc2626' },
];

// ---- Pull Requests ----
const prTitles = [
  'Add repository health scoring engine',
  'Improve contributor heatmap performance',
  'Fix webhook duplicate event processing',
  'Add GitHub OAuth authentication flow',
  'Implement real-time event streaming',
  'Add dark mode theme support',
  'Optimize dashboard query caching',
  'Add alert rule builder wizard',
  'Implement contribution analytics charts',
  'Fix timezone handling in date filters',
  'Add command palette with search',
  'Implement repository comparison view',
  'Add PDF report generation',
  'Fix memory leak in WebSocket client',
  'Add contributor profile page',
];

export const mockPullRequests: PullRequest[] = prTitles.map((title, i) => {
  const states: Array<'open' | 'merged' | 'closed'> = ['open', 'merged', 'merged', 'merged', 'closed'];
  const state = states[i % states.length];
  const daysAgo = i * 3;
  const created = new Date();
  created.setDate(created.getDate() - daysAgo);
  const merged = state === 'merged' ? new Date(created.getTime() + (1 + Math.random() * 48) * 3600000) : null;
  const closed = state === 'closed' ? new Date(created.getTime() + (24 + Math.random() * 72) * 3600000) : null;

  return {
    id: `pr-${String(i + 1).padStart(3, '0')}`,
    number: 421 - i,
    title,
    state,
    author: contributorRefs[i % contributorRefs.length],
    reviewers: [contributorRefs[(i + 1) % contributorRefs.length], contributorRefs[(i + 2) % contributorRefs.length]],
    labels: [prLabels[i % prLabels.length]],
    repositoryId: mockRepositories[i % mockRepositories.length].id,
    createdAt: created.toISOString(),
    updatedAt: (merged || closed || created).toISOString(),
    mergedAt: merged?.toISOString() || null,
    closedAt: (merged || closed)?.toISOString() || null,
    additions: 50 + Math.floor(Math.random() * 500),
    deletions: 10 + Math.floor(Math.random() * 150),
    filesChanged: 2 + Math.floor(Math.random() * 15),
    reviewLatencyHours: state === 'open' ? null : 2 + Math.random() * 24,
    mergeTimeHours: state === 'merged' ? 4 + Math.random() * 48 : null,
    isDraft: i === 3,
    url: `https://github.com/${mockRepositories[i % mockRepositories.length].fullName}/pull/${421 - i}`,
  };
});

// ---- Issues ----
const issueTitles = [
  'Webhook delivery occasionally delayed under load',
  'Dashboard loading slow on large repositories',
  'Contributor identities duplicated across repos',
  'Alert grouping needs improvement for spam prevention',
  'GitHub API rate limit warning not displaying',
  'Health score calculation inaccurate for new repos',
  'Dark mode contrast issues on chart tooltips',
  'Mobile sidebar not closing on navigation',
  'Real-time events missing after reconnect',
  'Export PDF layout breaks with long repo names',
  'Search results not highlighting matched text',
  'Contribution heatmap missing weekend data',
  'PR review latency metric incorrect for drafts',
  'Settings page form loses data on theme toggle',
  'Alert notification sound not playing on mobile',
  'Branch monitoring shows deleted branches',
  'CI status badge not updating in real-time',
  'Report scheduling timezone conversion wrong',
  'Avatar images not loading for org contributors',
  'Command palette not accessible via keyboard',
  'Repository import progress stuck at 99%',
  'Issue age calculation off by one day',
];

export const mockIssues: Issue[] = issueTitles.map((title, i) => {
  const states: Array<'open' | 'closed'> = ['open', 'open', 'closed', 'closed', 'closed'];
  const state = states[i % states.length];
  const daysAgo = i * 4 + Math.floor(Math.random() * 5);
  const created = new Date();
  created.setDate(created.getDate() - daysAgo);
  const closed = state === 'closed' ? new Date(created.getTime() + (12 + Math.random() * 168) * 3600000) : null;
  const firstResponse = new Date(created.getTime() + (2 + Math.random() * 48) * 3600000);

  return {
    id: `issue-${String(i + 1).padStart(3, '0')}`,
    number: 200 - i,
    title,
    state,
    author: contributorRefs[i % contributorRefs.length],
    labels: [issueLabels[i % issueLabels.length], ...(i % 3 === 0 ? [issueLabels[(i + 3) % issueLabels.length]] : [])],
    repositoryId: mockRepositories[i % mockRepositories.length].id,
    createdAt: created.toISOString(),
    updatedAt: (closed || firstResponse).toISOString(),
    closedAt: closed?.toISOString() || null,
    firstResponseAt: firstResponse.toISOString(),
    firstResponseHours: (firstResponse.getTime() - created.getTime()) / 3600000,
    isStale: state === 'open' && daysAgo > 14,
    url: `https://github.com/${mockRepositories[i % mockRepositories.length].fullName}/issues/${200 - i}`,
  };
});

// ---- Alert Rules ----
export const mockAlertRules: AlertRule[] = [
  { id: 'alert-rule-001', name: 'CI Failure Alert', event: 'workflow_failure', condition: 'workflow_run.status = failure', repositoryId: 'repo-004', repositoryName: 'Zectral/repopulse', channel: 'discord', severity: 'critical', state: 'active', throttleMinutes: 15, quietHoursStart: null, quietHoursEnd: null, createdAt: '2026-08-01T10:00:00Z', lastTriggeredAt: '2026-09-29T16:02:00Z' },
  { id: 'alert-rule-002', name: 'Commit Spike Detection', event: 'commit_spike', condition: 'commits > baseline * 2.5', repositoryId: 'repo-003', repositoryName: 'Zectral/canopi', channel: 'email', severity: 'warning', state: 'active', throttleMinutes: 60, quietHoursStart: '22:00', quietHoursEnd: '08:00', createdAt: '2026-08-15T14:00:00Z', lastTriggeredAt: '2026-09-29T15:48:00Z' },
  { id: 'alert-rule-003', name: 'Force Push Protection', event: 'force_push', condition: 'branch = main', repositoryId: 'repo-001', repositoryName: 'Zectral/the-grocery-hub', channel: 'slack', severity: 'critical', state: 'active', throttleMinutes: 0, quietHoursStart: null, quietHoursEnd: null, createdAt: '2026-07-20T09:00:00Z', lastTriggeredAt: null },
  { id: 'alert-rule-004', name: 'Star Spike Alert', event: 'star_spike', condition: 'stars_per_hour > 10', repositoryId: 'repo-002', repositoryName: 'Zectral/agentic-ai-platform', channel: 'telegram', severity: 'info', state: 'active', throttleMinutes: 120, quietHoursStart: null, quietHoursEnd: null, createdAt: '2026-09-01T16:00:00Z', lastTriggeredAt: '2026-09-28T20:00:00Z' },
  { id: 'alert-rule-005', name: 'Stale PR Warning', event: 'pull_request', condition: 'age > 7 days AND reviews = 0', repositoryId: 'repo-001', repositoryName: 'Zectral/the-grocery-hub', channel: 'discord', severity: 'warning', state: 'active', throttleMinutes: 1440, quietHoursStart: '22:00', quietHoursEnd: '08:00', createdAt: '2026-09-10T11:00:00Z', lastTriggeredAt: '2026-09-29T08:00:00Z' },
];

// ---- Alerts ----
export const mockAlerts: Alert[] = [
  { id: 'alert-001', ruleId: 'alert-rule-001', type: 'workflow_failure', severity: 'critical', repository: 'Zectral/repopulse', message: 'Production CI workflow failed on main branch', channel: 'discord', createdAt: '2026-09-29T16:02:00Z', read: false },
  { id: 'alert-002', ruleId: 'alert-rule-002', type: 'commit_spike', severity: 'warning', repository: 'Zectral/canopi', message: 'Commit activity increased 280% above baseline', channel: 'email', createdAt: '2026-09-29T15:48:00Z', read: false },
  { id: 'alert-003', ruleId: 'alert-rule-005', type: 'stale_pr', severity: 'warning', repository: 'Zectral/the-grocery-hub', message: 'PR #418 has been open for 8 days without review', channel: 'discord', createdAt: '2026-09-29T08:00:00Z', read: true },
  { id: 'alert-004', ruleId: 'alert-rule-004', type: 'star_spike', severity: 'info', repository: 'Zectral/agentic-ai-platform', message: 'Repository received 15 stars in the last hour', channel: 'telegram', createdAt: '2026-09-28T20:00:00Z', read: true },
];

// ---- Activity Events ----
export const mockActivityEvents: ActivityEvent[] = [
  { id: 'evt-001', type: 'push', repositoryId: 'repo-004', repositoryName: 'Zectral/repopulse', actor: contributorRefs[0], timestamp: new Date(Date.now() - 2000).toISOString(), title: 'Pushed 3 commits', description: 'feat: add repository health analytics' },
  { id: 'evt-002', type: 'pull_request', repositoryId: 'repo-001', repositoryName: 'Zectral/the-grocery-hub', actor: contributorRefs[1], timestamp: new Date(Date.now() - 18000).toISOString(), title: 'Opened PR #421', description: 'Add repository health scoring engine' },
  { id: 'evt-003', type: 'workflow_run', repositoryId: 'repo-003', repositoryName: 'Zectral/canopi', actor: contributorRefs[2], timestamp: new Date(Date.now() - 60000).toISOString(), title: 'CI workflow failed', description: 'Build failed on main branch' },
  { id: 'evt-004', type: 'issues', repositoryId: 'repo-002', repositoryName: 'Zectral/agentic-ai-platform', actor: contributorRefs[3], timestamp: new Date(Date.now() - 180000).toISOString(), title: 'Closed issue #182', description: 'Fixed webhook duplicate processing' },
  { id: 'evt-005', type: 'star', repositoryId: 'repo-002', repositoryName: 'Zectral/agentic-ai-platform', actor: contributorRefs[4], timestamp: new Date(Date.now() - 300000).toISOString(), title: 'Starred the repository' },
  { id: 'evt-006', type: 'release', repositoryId: 'repo-001', repositoryName: 'Zectral/the-grocery-hub', actor: contributorRefs[0], timestamp: new Date(Date.now() - 600000).toISOString(), title: 'Published release v2.4.0', description: '42 commits, 18 contributors' },
  { id: 'evt-007', type: 'fork', repositoryId: 'repo-004', repositoryName: 'Zectral/repopulse', actor: contributorRefs[5], timestamp: new Date(Date.now() - 900000).toISOString(), title: 'Forked the repository' },
  { id: 'evt-008', type: 'push', repositoryId: 'repo-001', repositoryName: 'Zectral/the-grocery-hub', actor: contributorRefs[2], timestamp: new Date(Date.now() - 1200000).toISOString(), title: 'Pushed 1 commit', description: 'fix: resolve timezone handling' },
];

// ---- Notifications ----
export const mockNotifications: Notification[] = [
  { id: 'notif-001', severity: 'critical', title: 'CI Failed', description: 'Production workflow failed on Zectral/repopulse', timestamp: '2026-09-29T16:02:00Z', read: false, repositoryName: 'Zectral/repopulse' },
  { id: 'notif-002', severity: 'warning', title: 'Commit Spike Detected', description: 'Commit activity increased 280% on Zectral/canopi', timestamp: '2026-09-29T15:48:00Z', read: false, repositoryName: 'Zectral/canopi' },
  { id: 'notif-003', severity: 'warning', title: 'Stale PR', description: 'PR #418 needs review on Zectral/the-grocery-hub', timestamp: '2026-09-29T08:00:00Z', read: false, repositoryName: 'Zectral/the-grocery-hub' },
  { id: 'notif-004', severity: 'info', title: 'New Contributor', description: 'divya joined Zectral/repopulse', timestamp: '2026-09-28T14:00:00Z', read: true },
  { id: 'notif-005', severity: 'info', title: 'Star Milestone', description: 'agentic-ai-platform reached 2,300 stars', timestamp: '2026-09-28T10:00:00Z', read: true, repositoryName: 'Zectral/agentic-ai-platform' },
];

// ---- Workflow Runs ----
export const mockWorkflowRuns: WorkflowRun[] = [
  { id: 'wf-001', name: 'CI Build', repositoryId: 'repo-004', status: 'passing', branch: 'main', sha: 'a1b2c3d', duration: 252, createdAt: '2026-09-29T16:00:00Z', url: '#' },
  { id: 'wf-002', name: 'Deploy Production', repositoryId: 'repo-001', status: 'passing', branch: 'main', sha: 'e4f5g6h', duration: 180, createdAt: '2026-09-29T15:30:00Z', url: '#' },
  { id: 'wf-003', name: 'CI Build', repositoryId: 'repo-003', status: 'failed', branch: 'main', sha: 'i7j8k9l', duration: 48, createdAt: '2026-09-29T14:45:00Z', url: '#' },
  { id: 'wf-004', name: 'Tests', repositoryId: 'repo-002', status: 'passing', branch: 'develop', sha: 'm1n2o3p', duration: 312, createdAt: '2026-09-29T14:00:00Z', url: '#' },
];

// ---- Reports ----
export const mockReports: Report[] = [
  { id: 'report-001', title: 'Weekly Intelligence Report', period: 'Sep 22 – Sep 29, 2026', generatedAt: '2026-09-29T06:00:00Z', health: 84, healthChange: 6, commits: 312, prsMerged: 42, issuesClosed: 38, topContributor: 'Abhi Ghosh', repositories: 6 },
  { id: 'report-002', title: 'Weekly Intelligence Report', period: 'Sep 15 – Sep 22, 2026', generatedAt: '2026-09-22T06:00:00Z', health: 78, healthChange: 3, commits: 274, prsMerged: 35, issuesClosed: 29, topContributor: 'Priya Sharma', repositories: 6 },
];

// ---- Time-series generator ----
export function generateTimeSeriesData(days: number = 90) {
  const data: RepositorySnapshot[] = [];
  const now = new Date();

  for (let i = days; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const dayStr = date.toISOString().split('T')[0];

    // Deterministic pseudo-random using day index
    const seed = i * 7 + 13;
    const baseCommits = 8 + Math.floor(Math.sin(seed) * 4 + 4);
    const weekday = date.getDay();
    const isWeekend = weekday === 0 || weekday === 6;
    const commits = isWeekend ? Math.max(1, Math.floor(baseCommits * 0.3)) : baseCommits;

    data.push({
      id: `snap-${dayStr}`,
      repositoryId: 'all',
      date: dayStr,
      commits,
      additions: commits * (30 + Math.floor(Math.abs(Math.sin(seed * 3)) * 40)),
      deletions: commits * (5 + Math.floor(Math.abs(Math.cos(seed * 2)) * 15)),
      stars: 1100 + Math.floor(i * 1.6 + Math.sin(i / 7) * 20),
      forks: 160 + Math.floor(i * 0.25),
      watchers: 80 + Math.floor(i * 0.18),
      openIssues: 25 + Math.floor(Math.sin(i / 10) * 8),
      contributors: 6 + Math.floor(Math.abs(Math.sin(i / 5)) * 4),
    });
  }

  return data;
}

// ---- Heatmap data generator ----
export function generateHeatmapData(days: number = 365) {
  const data: Array<{ date: string; count: number }> = [];
  const now = new Date();

  for (let i = days; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const dayStr = date.toISOString().split('T')[0];
    const weekday = date.getDay();
    const isWeekend = weekday === 0 || weekday === 6;
    const seed = i * 11 + 7;
    const base = isWeekend ? 2 : 8;
    const count = Math.max(0, Math.floor(base + Math.sin(seed) * base * 0.8));

    data.push({ date: dayStr, count });
  }

  return data;
}

export { contributorRefs };
