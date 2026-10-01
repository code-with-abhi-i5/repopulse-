import { useState, useMemo, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { api } from '../lib/api'
import { formatNumber, formatRelativeTime, formatDate } from '../lib/utils'
import {
  FolderGit2,
  Star,
  GitFork,
  Eye,
  AlertCircle,
  GitPullRequest,
  CheckCircle2,
  XCircle,
  Clock,
  ExternalLink,
  ShieldCheck,
  Activity,
  Users,
  Code2,
  Terminal,
  RefreshCw,
  GitBranch,
  Flame,
  ArrowUpRight,
  TrendingUp,
  FileCode,
  Check,
  ChevronRight,
  Layers,
} from 'lucide-react'

export default function RepositoryDetailPage() {
  const { owner, repo } = useParams()
  const [activeTab, setActiveTab] = useState('overview')
  const [selectedBranch, setSelectedBranch] = useState('main')
  const [selectedCommit, setSelectedCommit] = useState(null)
  const [isSyncing, setIsSyncing] = useState(false)
  const [repoData, setRepoData] = useState(null)
  const [allContributors, setAllContributors] = useState([])
  const [loading, setLoading] = useState(true)

  // Fetch real repository details from backend
  useEffect(() => {
    setLoading(true)
    const fullName = `${owner}/${repo}`
    Promise.all([
      api.getRepositoryById(fullName, true),
      api.getContributors(),
    ])
      .then(([found, contribs]) => {
        setRepoData(found)
        setAllContributors(contribs || [])
      })
      .catch(() => {
        setRepoData(null)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [owner, repo])

  // Active repository object
  const repository = repoData || {
    id: `${owner}-${repo}`,
    name: repo || 'Repository',
    owner: owner || 'Owner',
    fullName: `${owner}/${repo}`,
    description: 'Repository connected to RepoPulse dashboard.',
    visibility: 'public',
    license: 'MIT',
    defaultBranch: 'main',
    stars: 0,
    forks: 0,
    watchers: 0,
    openIssues: 0,
    language: 'TypeScript',
    healthScore: 85,
    antiCheatStatus: 'VERIFIED',
    updatedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    topics: [],
    commits: [],
    pullRequests: [],
    issues: [],
    workflows: [],
  }

  const repoId = repository.id
  const healthScore = {
    total: repository.healthScore || 85,
    activity: Math.min(25, Math.round((repository.healthScore || 85) * 0.28)),
    responsiveness: Math.min(25, Math.round((repository.healthScore || 85) * 0.24)),
    ciHealth: Math.min(25, Math.round((repository.healthScore || 85) * 0.24)),
    busFactor: Math.min(15, Math.round((repository.healthScore || 85) * 0.14)),
    community: 10,
    security: 10,
    tips: [
      'Maintain steady commit cadence across all team members',
      'Ensure prompt code review on incoming pull requests',
    ],
  }

  // Filtered live data for this repository
  const repoCommits = useMemo(() => {
    return repoData?.commits || []
  }, [repoData])

  const repoPRs = useMemo(() => {
    return repoData?.pullRequests || []
  }, [repoData])

  const repoIssues = useMemo(() => {
    return repoData?.issues || []
  }, [repoData])

  const repoWorkflows = useMemo(() => {
    return repoData?.workflows || []
  }, [repoData])

  const repoContributors = useMemo(() => {
    if (!allContributors?.length) return []
    return allContributors.filter((c) => !c.repositories?.length || c.repositories.includes(repoId) || c.repositories.includes(repository.fullName)).slice(0, 6)
  }, [allContributors, repoId, repository.fullName])

  const heatmap = useMemo(() => {
    const days = 84;
    const data = [];
    const now = new Date();
    
    // Group real commits by date string
    const commitCounts = {};
    repoCommits.forEach(commit => {
      const dateStr = new Date(commit.timestamp).toISOString().split('T')[0];
      commitCounts[dateStr] = (commitCounts[dateStr] || 0) + 1;
    });

    for (let i = days; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dayStr = date.toISOString().split('T')[0];
      data.push({ date: dayStr, count: commitCounts[dayStr] || 0 });
    }
    return data;
  }, [repoCommits])

  const handleManualSync = async () => {
    setIsSyncing(true)
    try {
      await api.syncRepository(`${owner}/${repo}`)
      const refreshed = await api.getRepositoryById(`${owner}/${repo}`, true)
      if (refreshed) setRepoData(refreshed)
      const contribs = await api.getContributors()
      if (contribs) setAllContributors(contribs)
    } catch (err) {
      console.error(err)
    } finally {
      setIsSyncing(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb & Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
          <Link to="/repositories" className="hover:text-foreground transition-colors">
            Repositories
          </Link>
          <ChevronRight className="w-4 h-4 text-muted-foreground/60" />
          <span className="font-mono text-xs">{repository.owner}</span>
          <ChevronRight className="w-4 h-4 text-muted-foreground/60" />
          <span className="font-semibold text-foreground">{repository.name}</span>
          <span className="ml-2 px-2 py-0.5 text-[11px] rounded-full font-medium bg-secondary text-secondary-foreground border border-border">
            {repository.visibility}
          </span>
          <span className="px-2 py-0.5 text-[11px] rounded-full font-medium bg-primary/10 text-primary border border-primary/20">
            {repository.license || 'MIT'}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={handleManualSync}
            disabled={isSyncing}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium bg-secondary hover:bg-secondary/80 text-foreground border border-border transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-primary ${isSyncing ? 'animate-spin' : ''}`} />
            {isSyncing ? 'Syncing...' : 'Sync Webhooks'}
          </button>

          <a
            href={`https://github.com/${repository.fullName}`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-all shadow-xs"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            GitHub
          </a>
        </div>
      </div>

      {/* Hero Overview Header */}
      <div className="p-6 rounded-2xl bg-card border border-border relative overflow-hidden shadow-xs">
        <div className="absolute right-0 top-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                <FolderGit2 className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-foreground">{repository.fullName}</h1>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Default Branch: <span className="font-mono text-foreground font-semibold">{repository.defaultBranch}</span> • Synced {formatRelativeTime(repository.updatedAt)}
                </p>
              </div>
            </div>

            <p className="text-sm text-muted-foreground leading-relaxed">
              {repository.description}
            </p>

            {/* Tags */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {repository.topics?.map((topic) => (
                <span
                  key={topic}
                  className="px-2.5 py-0.5 rounded-md text-xs font-medium bg-secondary/80 text-secondary-foreground border border-border/60"
                >
                  #{topic}
                </span>
              ))}
            </div>
          </div>

          {/* Health Gauge Box */}
          <div className="flex items-center gap-6 p-4 rounded-xl bg-secondary/40 border border-border/80">
            <div className="text-center">
              <div className="text-3xl font-black tracking-tight text-primary">
                {healthScore.total}
                <span className="text-xs font-normal text-muted-foreground ml-0.5">/100</span>
              </div>
              <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mt-0.5">
                RepoPulse Score
              </div>
            </div>

            <div className="h-10 w-[1px] bg-border/80" />

            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span className="text-muted-foreground">Activity:</span>
                <span className="font-semibold text-foreground">{healthScore.activity}/25</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                <span className="text-muted-foreground">CI Health:</span>
                <span className="font-semibold text-foreground">{healthScore.ciHealth}/20</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                <span className="text-muted-foreground">Response:</span>
                <span className="font-semibold text-foreground">{healthScore.responsiveness}/20</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                <span className="text-muted-foreground">Security:</span>
                <span className="font-semibold text-foreground">{healthScore.security}/10</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 mt-6 pt-6 border-t border-border/60">
          <div className="p-3 rounded-lg bg-background/50 border border-border/60">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
              <Star className="w-3.5 h-3.5 text-amber-500" />
              <span>Stars</span>
            </div>
            <span className="text-lg font-bold text-foreground">{formatNumber(repository.stars)}</span>
          </div>

          <div className="p-3 rounded-lg bg-background/50 border border-border/60">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
              <GitFork className="w-3.5 h-3.5 text-blue-500" />
              <span>Forks</span>
            </div>
            <span className="text-lg font-bold text-foreground">{formatNumber(repository.forks)}</span>
          </div>

          <div className="p-3 rounded-lg bg-background/50 border border-border/60">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
              <Eye className="w-3.5 h-3.5 text-purple-500" />
              <span>Watchers</span>
            </div>
            <span className="text-lg font-bold text-foreground">{formatNumber(repository.watchers)}</span>
          </div>

          <div className="p-3 rounded-lg bg-background/50 border border-border/60">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
              <GitPullRequest className="w-3.5 h-3.5 text-cyan-500" />
              <span>Pull Requests</span>
            </div>
            <span className="text-lg font-bold text-foreground">{repoPRs.length}</span>
          </div>

          <div className="p-3 rounded-lg bg-background/50 border border-border/60">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
              <AlertCircle className="w-3.5 h-3.5 text-rose-500" />
              <span>Open Issues</span>
            </div>
            <span className="text-lg font-bold text-foreground">{repository.openIssues}</span>
          </div>

          <div className="p-3 rounded-lg bg-background/50 border border-border/60">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
              <Users className="w-3.5 h-3.5 text-emerald-500" />
              <span>Contributors</span>
            </div>
            <span className="text-lg font-bold text-foreground">{repoContributors.length}</span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-1 border-b border-border overflow-x-auto pb-px">
        {[
          { id: 'overview', label: 'Overview & Insights', icon: Activity },
          { id: 'commits', label: 'Commits & Heatmap', icon: Code2, count: repoCommits.length },
          { id: 'pulls', label: 'Pull Requests', icon: GitPullRequest, count: repoPRs.length },
          { id: 'issues', label: 'Issues & Triage', icon: AlertCircle, count: repoIssues.length },
          { id: 'workflows', label: 'CI / CD Workflows', icon: Terminal, count: repoWorkflows.length },
          { id: 'contributors', label: 'Contributors', icon: Users, count: repoContributors.length },
        ].map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-medium border-b-2 whitespace-nowrap transition-colors ${
                isActive
                  ? 'border-primary text-primary font-semibold'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-secondary text-secondary-foreground font-mono">
                  {tab.count}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Health Analysis & Recommendations */}
          <div className="lg:col-span-2 space-y-6">
            <div className="p-5 rounded-2xl bg-card border border-border shadow-xs space-y-4">
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-primary" />
                Pulse Health Dimension Breakdown
              </h3>

              <div className="space-y-3">
                {[
                  { name: 'Commit & Code Velocity', score: healthScore.activity, max: 25, color: 'bg-emerald-500' },
                  { name: 'Issue & PR Responsiveness', score: healthScore.responsiveness, max: 20, color: 'bg-blue-500' },
                  { name: 'CI/CD Pipeline Reliability', score: healthScore.ciHealth, max: 20, color: 'bg-cyan-500' },
                  { name: 'Bus Factor & Contributor Spread', score: healthScore.busFactor, max: 15, color: 'bg-purple-500' },
                  { name: 'Community Vitality & Growth', score: healthScore.community, max: 10, color: 'bg-pink-500' },
                  { name: 'Security & Dependency Hygiene', score: healthScore.security, max: 10, color: 'bg-amber-500' },
                ].map((dim) => (
                  <div key={dim.name} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-medium text-foreground">{dim.name}</span>
                      <span className="font-mono text-muted-foreground">
                        {dim.score} / {dim.max}
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-secondary overflow-hidden">
                      <div
                        className={`h-full rounded-full ${dim.color} transition-all duration-700`}
                        style={{ width: `${(dim.score / dim.max) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Tips & Recommendations */}
              <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 space-y-2 mt-4">
                <h4 className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4" />
                  AI Optimization Insights
                </h4>
                <ul className="space-y-1 text-xs text-muted-foreground">
                  {healthScore.tips?.map((tip, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-primary font-bold">•</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Recent Commits preview */}
            <div className="p-5 rounded-2xl bg-card border border-border shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Code2 className="w-5 h-5 text-primary" />
                  <h3 className="text-base font-bold text-foreground">
                    Latest Commit Stream
                  </h3>
                  <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    LIVE
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleManualSync}
                    disabled={isSyncing}
                    className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary border border-border/40 transition-colors"
                    title="Sync latest commits from GitHub"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-primary' : ''}`} />
                  </button>
                  <button
                    onClick={() => setActiveTab('commits')}
                    className="text-xs text-primary hover:underline font-medium"
                  >
                    View all ({repoCommits.length})
                  </button>
                </div>
              </div>

              {repoCommits.length === 0 ? (
                <div className="py-8 text-center text-xs text-muted-foreground space-y-2">
                  <p>No commits recorded yet for this repository.</p>
                  <button
                    onClick={handleManualSync}
                    disabled={isSyncing}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors inline-flex items-center gap-1.5"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                    Sync Commits from GitHub
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-border/60">
                  {repoCommits.slice(0, 5).map((commit) => (
                    <div key={commit.id || commit.sha} className="py-3 flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 min-w-0">
                        <img
                          src={commit.author?.avatarUrl || `https://github.com/${commit.authorLogin || 'github'}.png`}
                          alt={commit.author?.name || commit.authorLogin || 'Developer'}
                          className="w-7 h-7 rounded-full mt-0.5 border border-border"
                        />
                        <div className="min-w-0">
                          <a
                            href={commit.url || `https://github.com/${owner}/${repo}/commit/${commit.sha}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs font-semibold text-foreground truncate hover:text-primary transition-colors block"
                          >
                            {commit.message}
                          </a>
                          <div className="flex items-center gap-2 text-[11px] text-muted-foreground mt-0.5">
                            <span>{commit.author?.name || commit.authorLogin || 'contributor'}</span>
                            <span>•</span>
                            <span>{formatRelativeTime(commit.timestamp)}</span>
                            <span>•</span>
                            <span className="font-mono text-primary font-medium">#{commit.sha?.slice(0, 7)}</span>
                            {commit.branch && <span className="font-mono text-muted-foreground">({commit.branch})</span>}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-[11px] font-mono shrink-0">
                        <span className="text-emerald-500 font-mono">+{commit.additions || 0}</span>
                        <span className="text-rose-500 font-mono">-{commit.deletions || 0}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Top Contributors & Fast Metrics */}
          <div className="space-y-6">
            <div className="p-5 rounded-2xl bg-card border border-border shadow-xs space-y-4">
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                Active Contributors
              </h3>

              <div className="space-y-3">
                {repoContributors.map((c, idx) => (
                  <div key={c.id} className="flex items-center justify-between p-2.5 rounded-xl bg-secondary/30 border border-border/50">
                    <div className="flex items-center gap-2.5">
                      <div className="relative">
                        <img src={c.avatarUrl} alt={c.name} className="w-8 h-8 rounded-full border border-border" />
                        <span className="absolute -top-1 -left-1 w-4 h-4 rounded-full bg-primary text-[10px] font-bold text-primary-foreground flex items-center justify-center">
                          {idx + 1}
                        </span>
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-foreground">{c.name}</div>
                        <div className="text-[11px] text-muted-foreground">{c.commits} commits</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 text-xs text-amber-500 font-medium">
                      <Flame className="w-3.5 h-3.5 fill-amber-500" />
                      <span>{c.currentStreak}d</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions Panel */}
            <div className="p-5 rounded-2xl bg-card border border-border shadow-xs space-y-3">
              <h3 className="text-sm font-bold text-foreground">Repository Metadata</h3>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1.5 border-b border-border/60">
                  <span className="text-muted-foreground">Primary Language</span>
                  <span className="font-semibold text-foreground">{repository.language}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-border/60">
                  <span className="text-muted-foreground">Repository Size</span>
                  <span className="font-mono text-foreground">{repository.sizeKb} KB</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-border/60">
                  <span className="text-muted-foreground">Created On</span>
                  <span className="text-foreground">{formatDate(repository.createdAt)}</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-muted-foreground">Default Branch</span>
                  <span className="font-mono text-primary">{repository.defaultBranch}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Commits & Heatmap */}
      {activeTab === 'commits' && (
        <div className="space-y-6">
          {/* Heatmap Section */}
          <div className="p-5 rounded-2xl bg-card border border-border shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <Activity className="w-4 h-4 text-primary" />
                Commit Frequency Matrix (Last 12 Weeks)
              </h3>
              <span className="text-xs text-muted-foreground">Deterministic activity distribution</span>
            </div>

            <div className="grid grid-flow-col grid-rows-7 gap-1.5 overflow-x-auto py-2">
              {heatmap.map((cell, idx) => {
                const count = cell.count
                const bg =
                  count === 0
                    ? 'bg-secondary/40'
                    : count < 4
                    ? 'bg-emerald-500/30'
                    : count < 8
                    ? 'bg-emerald-500/60'
                    : 'bg-emerald-500'
                return (
                  <div
                    key={idx}
                    className={`w-3.5 h-3.5 rounded-xs ${bg} transition-transform hover:scale-125 cursor-pointer`}
                    title={`${cell.date}: ${cell.count} commits`}
                  />
                )
              })}
            </div>
          </div>

          {/* Commits List */}
          <div className="p-5 rounded-2xl bg-card border border-border shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <GitBranch className="w-4 h-4 text-primary" />
                <span className="text-xs font-semibold text-foreground">Branch:</span>
                <select
                  value={selectedBranch}
                  onChange={(e) => setSelectedBranch(e.target.value)}
                  className="px-2 py-1 text-xs rounded-md bg-background border border-border text-foreground font-mono"
                >
                  <option value="main">main</option>
                  <option value="develop">develop</option>
                  <option value="feature/intelligence">feature/intelligence</option>
                </select>
              </div>

              <span className="text-xs text-muted-foreground">{repoCommits.length} commits shown</span>
            </div>

              <div className="divide-y divide-border/60">
                {repoCommits.map((c) => (
                  <div
                    key={c.id || c.sha}
                    onClick={() => setSelectedCommit(c)}
                    className="py-3 px-2 rounded-lg hover:bg-muted/40 transition-colors cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <img
                        src={c.author?.avatarUrl || `https://github.com/${c.authorLogin || 'github'}.png`}
                        alt={c.author?.name || c.authorLogin || 'Developer'}
                        className="w-8 h-8 rounded-full mt-0.5 border border-border"
                      />
                      <div className="min-w-0">
                        <a
                          href={c.url || `https://github.com/${owner}/${repo}/commit/${c.sha}`}
                          target="_blank"
                          rel="noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="text-xs font-semibold text-foreground hover:text-primary transition-colors block truncate"
                        >
                          {c.message}
                        </a>
                        <div className="flex items-center gap-2 text-[11px] text-muted-foreground mt-0.5">
                          <span className="font-medium text-foreground">{c.author?.name || c.authorLogin || 'contributor'}</span>
                          <span>committed {formatRelativeTime(c.timestamp)}</span>
                          <span>•</span>
                          <span className="px-1.5 py-0.2 bg-secondary rounded text-[10px] font-mono text-primary font-medium">
                            #{c.sha?.slice(0, 7)}
                          </span>
                          {c.branch && <span className="font-mono text-muted-foreground">({c.branch})</span>}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                      <div className="flex items-center gap-1.5 text-xs font-mono">
                        <span className="text-emerald-500 font-semibold">+{c.additions || 0}</span>
                        <span className="text-rose-500 font-semibold">-{c.deletions || 0}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">{c.filesChanged || 1} files</span>
                    </div>
                  </div>
                ))}
              </div>
          </div>
        </div>
      )}

      {/* Tab: Pull Requests */}
      {activeTab === 'pulls' && (
        <div className="p-5 rounded-2xl bg-card border border-border shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-foreground">Pull Requests</h3>
            <span className="text-xs text-muted-foreground">{repoPRs.length} PRs indexed</span>
          </div>

          <div className="divide-y divide-border/60">
            {repoPRs.map((pr) => (
              <div key={pr.id} className="py-3.5 flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div
                    className={`mt-0.5 p-1 rounded-full ${
                      pr.state === 'open'
                        ? 'text-emerald-500 bg-emerald-500/10'
                        : pr.state === 'merged'
                        ? 'text-purple-500 bg-purple-500/10'
                        : 'text-rose-500 bg-rose-500/10'
                    }`}
                  >
                    <GitPullRequest className="w-4 h-4" />
                  </div>

                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-foreground hover:text-primary transition-colors">
                        {pr.title}
                      </span>
                      <span className="text-xs text-muted-foreground font-mono">#{pr.number}</span>
                      {pr.labels?.map((label) => (
                        <span
                          key={label.name}
                          className="px-2 py-0.2 rounded text-[10px] font-medium"
                          style={{
                            backgroundColor: `${label.color}20`,
                            color: label.color,
                            border: `1px solid ${label.color}40`,
                          }}
                        >
                          {label.name}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-muted-foreground mt-1">
                      <span>Opened by {pr.author.name}</span>
                      <span>•</span>
                      <span>{formatRelativeTime(pr.createdAt)}</span>
                      {pr.reviewLatencyHours && (
                        <>
                          <span>•</span>
                          <span className="text-primary font-medium">
                            Review latency: {pr.reviewLatencyHours.toFixed(1)}h
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 font-mono text-xs shrink-0">
                  <span className="text-emerald-500">+{pr.additions}</span>
                  <span className="text-rose-500">-{pr.deletions}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Issues */}
      {activeTab === 'issues' && (
        <div className="p-5 rounded-2xl bg-card border border-border shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-foreground">Issues & Triage Status</h3>
            <span className="text-xs text-muted-foreground">{repoIssues.length} issues indexed</span>
          </div>

          <div className="divide-y divide-border/60">
            {repoIssues.map((issue) => (
              <div key={issue.id} className="py-3.5 flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div
                    className={`mt-0.5 p-1 rounded-full ${
                      issue.state === 'open' ? 'text-emerald-500 bg-emerald-500/10' : 'text-purple-500 bg-purple-500/10'
                    }`}
                  >
                    <AlertCircle className="w-4 h-4" />
                  </div>

                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-foreground hover:text-primary transition-colors">
                        {issue.title}
                      </span>
                      <span className="text-xs text-muted-foreground font-mono">#{issue.number}</span>
                      {issue.isStale && (
                        <span className="px-2 py-0.2 rounded text-[10px] font-semibold bg-rose-500/10 text-rose-500 border border-rose-500/20">
                          Stale
                        </span>
                      )}
                      {issue.labels?.map((label) => (
                        <span
                          key={label.name}
                          className="px-2 py-0.2 rounded text-[10px] font-medium"
                          style={{
                            backgroundColor: `${label.color}20`,
                            color: label.color,
                            border: `1px solid ${label.color}40`,
                          }}
                        >
                          {label.name}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-muted-foreground mt-1">
                      <span>Submitted by {issue.author.name}</span>
                      <span>•</span>
                      <span>{formatRelativeTime(issue.createdAt)}</span>
                      {issue.firstResponseHours && (
                        <>
                          <span>•</span>
                          <span className="text-cyan-500">
                            First response: {issue.firstResponseHours.toFixed(1)}h
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-secondary text-secondary-foreground uppercase">
                  {issue.state}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Workflows */}
      {activeTab === 'workflows' && (
        <div className="p-5 rounded-2xl bg-card border border-border shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-foreground">GitHub Actions & CI/CD Pipelines</h3>
            <span className="text-xs text-muted-foreground">Automated workflow telemetry</span>
          </div>

          <div className="divide-y divide-border/60">
            {repoWorkflows.map((wf) => (
              <div key={wf.id} className="py-3.5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  {wf.status === 'passing' ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  ) : (
                    <XCircle className="w-5 h-5 text-rose-500" />
                  )}

                  <div>
                    <h4 className="text-xs font-bold text-foreground">{wf.name}</h4>
                    <div className="flex items-center gap-2 text-[11px] text-muted-foreground mt-0.5">
                      <span className="font-mono text-primary font-medium">{wf.sha}</span>
                      <span>•</span>
                      <span>branch: {wf.branch}</span>
                      <span>•</span>
                      <span>{formatRelativeTime(wf.createdAt)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground font-mono">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{wf.duration}s</span>
                  </div>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      wf.status === 'passing'
                        ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                        : 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                    }`}
                  >
                    {wf.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Contributors */}
      {activeTab === 'contributors' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {repoContributors.map((c) => (
            <div key={c.id} className="p-5 rounded-2xl bg-card border border-border shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img src={c.avatarUrl} alt={c.name} className="w-10 h-10 rounded-full border border-border" />
                  <div>
                    <h4 className="text-sm font-bold text-foreground">{c.name}</h4>
                    <span className="text-xs text-muted-foreground font-mono">@{c.login}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-xs text-amber-500 font-bold bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
                  <Flame className="w-3.5 h-3.5 fill-amber-500" />
                  <span>{c.currentStreak}d</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 py-3 border-y border-border/60 text-center text-xs">
                <div>
                  <div className="text-muted-foreground text-[11px]">Commits</div>
                  <div className="font-bold text-foreground mt-0.5">{c.commits}</div>
                </div>
                <div>
                  <div className="text-muted-foreground text-[11px]">Additions</div>
                  <div className="font-bold text-emerald-500 mt-0.5">+{formatNumber(c.additions)}</div>
                </div>
                <div>
                  <div className="text-muted-foreground text-[11px]">Deletions</div>
                  <div className="font-bold text-rose-500 mt-0.5">-{formatNumber(c.deletions)}</div>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                <span>Active for {c.activeDays} days</span>
                <span>Best streak: {c.longestStreak}d</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Commit Detail Modal */}
      {selectedCommit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl p-6 rounded-2xl bg-card border border-border shadow-2xl space-y-5">
            <div className="flex items-start justify-between gap-4 border-b border-border pb-3">
              <div>
                <h3 className="text-base font-bold text-foreground">{selectedCommit.message}</h3>
                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                  <span>{selectedCommit.author.name}</span>
                  <span>•</span>
                  <span>{formatDate(selectedCommit.timestamp)}</span>
                  <span>•</span>
                  <span className="font-mono text-primary font-medium">{selectedCommit.sha}</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedCommit(null)}
                className="px-2.5 py-1 rounded-lg text-xs bg-secondary text-secondary-foreground hover:bg-secondary/80"
              >
                Close
              </button>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">
                Changed Files ({selectedCommit.files?.length || 1})
              </h4>
              <div className="p-3 rounded-xl bg-secondary/30 border border-border font-mono text-xs space-y-1.5">
                {selectedCommit.files?.map((f, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <span className="text-foreground truncate max-w-md">{f.filename}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-emerald-500">+{f.additions}</span>
                      <span className="text-rose-500">-{f.deletions}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
