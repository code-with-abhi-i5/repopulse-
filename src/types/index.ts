// ============================================================
// RepoPulse — Core Type Definitions
// ============================================================

// --- Repository ---
export interface Repository {
  id: string;
  githubId: number;
  name: string;
  fullName: string;
  owner: string;
  description: string;
  visibility: 'public' | 'private';
  defaultBranch: string;
  license: string | null;
  language: string;
  createdAt: string;
  updatedAt: string;
  pushedAt: string;
  stars: number;
  forks: number;
  watchers: number;
  openIssues: number;
  sizeKb: number;
  archived: boolean;
  topics: string[];
  healthScore: number;
  teamName?: string;
  hackathonBatch?: string;
  antiCheatStatus?: 'VERIFIED_FRESH' | 'PRE_EXISTING_FLAG' | 'AUDIT_PENDING';
}

export interface RepositorySnapshot {
  id: string;
  repositoryId: string;
  date: string;
  commits: number;
  additions: number;
  deletions: number;
  stars: number;
  forks: number;
  watchers: number;
  openIssues: number;
  contributors: number;
}

// --- Health Score ---
export interface HealthScore {
  total: number;
  activity: number;
  responsiveness: number;
  ciHealth: number;
  busFactor: number;
  community: number;
  security: number;
  tips: string[];
}

export type HealthStatus = 'excellent' | 'healthy' | 'needs-attention' | 'at-risk' | 'critical';

export function getHealthStatus(score: number): HealthStatus {
  if (score >= 90) return 'excellent';
  if (score >= 75) return 'healthy';
  if (score >= 60) return 'needs-attention';
  if (score >= 40) return 'at-risk';
  return 'critical';
}

export function getHealthLabel(status: HealthStatus): string {
  const labels: Record<HealthStatus, string> = {
    'excellent': 'Excellent',
    'healthy': 'Healthy',
    'needs-attention': 'Needs Attention',
    'at-risk': 'At Risk',
    'critical': 'Critical',
  };
  return labels[status];
}

// --- Commit ---
export interface Commit {
  id: string;
  sha: string;
  message: string;
  author: ContributorRef;
  committer: ContributorRef;
  branch: string;
  repositoryId: string;
  timestamp: string;
  additions: number;
  deletions: number;
  filesChanged: number;
  files: CommitFile[];
  url: string;
}

export interface CommitFile {
  filename: string;
  status: 'added' | 'modified' | 'removed' | 'renamed';
  additions: number;
  deletions: number;
}

export interface ContributorRef {
  login: string;
  name: string;
  avatarUrl: string;
}

// --- Contributor ---
export interface Contributor {
  id: string;
  login: string;
  name: string;
  avatarUrl: string;
  commits: number;
  pushesCount?: number;
  teamName?: string;
  primaryRepo?: string;
  additions: number;
  deletions: number;
  activeDays: number;
  firstCommitAt: string;
  lastCommitAt: string;
  currentStreak: number;
  longestStreak: number;
  isBot: boolean;
  repositories: string[];
}

// --- Pull Request ---
export type PRState = 'open' | 'merged' | 'closed';

export interface PullRequest {
  id: string;
  number: number;
  title: string;
  state: PRState;
  author: ContributorRef;
  reviewers: ContributorRef[];
  labels: Label[];
  repositoryId: string;
  createdAt: string;
  updatedAt: string;
  mergedAt: string | null;
  closedAt: string | null;
  additions: number;
  deletions: number;
  filesChanged: number;
  reviewLatencyHours: number | null;
  mergeTimeHours: number | null;
  isDraft: boolean;
  url: string;
}

export interface Label {
  name: string;
  color: string;
}

// --- Issue ---
export type IssueState = 'open' | 'closed';

export interface Issue {
  id: string;
  number: number;
  title: string;
  state: IssueState;
  author: ContributorRef;
  labels: Label[];
  repositoryId: string;
  createdAt: string;
  updatedAt: string;
  closedAt: string | null;
  firstResponseAt: string | null;
  firstResponseHours: number | null;
  isStale: boolean;
  url: string;
}

// --- Activity Event ---
export type ActivityEventType =
  | 'push'
  | 'pull_request'
  | 'issues'
  | 'release'
  | 'workflow_run'
  | 'star'
  | 'fork'
  | 'force_push';

export interface ActivityEvent {
  id: string;
  type: ActivityEventType;
  repositoryId: string;
  repositoryName: string;
  teamName?: string;
  actor: ContributorRef;
  timestamp: string;
  title: string;
  description?: string;
  url?: string;
  branch?: string;
  linesAdded?: number;
  linesDeleted?: number;
  commitCount?: number;
  commitSha?: string;
}

// --- Alert ---
export type AlertSeverity = 'critical' | 'warning' | 'info';
export type AlertState = 'active' | 'muted' | 'triggered' | 'failed';
export type AlertChannel = 'email' | 'slack' | 'discord' | 'telegram' | 'webhook';

export interface AlertRule {
  id: string;
  name: string;
  event: ActivityEventType | 'workflow_failure' | 'commit_spike' | 'star_spike';
  condition: string;
  repositoryId: string;
  repositoryName: string;
  channel: AlertChannel;
  severity: AlertSeverity;
  state: AlertState;
  throttleMinutes: number;
  quietHoursStart: string | null;
  quietHoursEnd: string | null;
  createdAt: string;
  lastTriggeredAt: string | null;
}

export interface Alert {
  id: string;
  ruleId: string;
  type: string;
  severity: AlertSeverity;
  repository: string;
  message: string;
  channel: AlertChannel;
  createdAt: string;
  read: boolean;
}

// --- Workflow / CI ---
export type WorkflowStatus = 'passing' | 'failed' | 'cancelled' | 'running';

export interface WorkflowRun {
  id: string;
  name: string;
  repositoryId: string;
  status: WorkflowStatus;
  branch: string;
  sha: string;
  duration: number;
  createdAt: string;
  url: string;
}

// --- Report ---
export interface Report {
  id: string;
  title: string;
  period: string;
  generatedAt: string;
  health: number;
  healthChange: number;
  commits: number;
  prsMerged: number;
  issuesClosed: number;
  topContributor: string;
  repositories: number;
}

// --- User ---
export interface User {
  id: string;
  login: string;
  name: string;
  avatarUrl: string;
  email: string;
}

// --- Connection Status ---
export type ConnectionStatus = 'live' | 'syncing' | 'reconnecting' | 'offline' | 'demo';

// --- Time Period ---
export type TimePeriod = '7d' | '30d' | '90d' | '1y' | 'all';

// --- Security ---
export interface SecurityAlert {
  id: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  category: 'dependabot' | 'code-scanning' | 'secret-scanning';
  title: string;
  repositoryId: string;
  createdAt: string;
  url: string;
}

// --- Rate Limit ---
export interface RateLimit {
  used: number;
  remaining: number;
  limit: number;
  resetAt: string;
}

// --- Notification ---
export interface Notification {
  id: string;
  severity: AlertSeverity;
  title: string;
  description: string;
  timestamp: string;
  read: boolean;
  repositoryName?: string;
}
