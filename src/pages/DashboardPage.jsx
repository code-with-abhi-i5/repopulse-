import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { formatNumber, formatRelativeTime, getGreeting } from '../lib/utils'
import { api } from '../lib/api'
import { generateTimeSeriesData } from '../data/mock'
import { useRealtimeStore, useDemoStore } from '../stores'
import {
  FolderGit2,
  GitCommit,
  GitPullRequest,
  CircleDot,
  Users,
  Heart,
  TrendingUp,
  TrendingDown,
  Plus,
  FileText,
  Star,
  GitFork,
  Tag,
  AlertTriangle,
  Activity,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Flame,
} from 'lucide-react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

export default function DashboardPage() {
  const navigate = useNavigate()
  const { liveEvents, setLiveEvents, addLiveEvent } = useRealtimeStore()
  const { isDemoMode } = useDemoStore()
  const [repositories, setRepositories] = useState([])
  const [contributors, setContributors] = useState([])
  const [chartPeriod, setChartPeriod] = useState('30')
  const chartData = generateTimeSeriesData(parseInt(chartPeriod, 10))

  useEffect(() => {
    api.getRepositories().then((data) => setRepositories(data || [])).catch(() => setRepositories([]))
    api.getContributors().then((data) => setContributors(data || [])).catch(() => setContributors([]))
    api.getActivities().then((data) => {
      if (data && data.length > 0) {
        setLiveEvents(data)
      }
    }).catch(() => {})
  }, [setLiveEvents])

  // Simulated live event injector (only active if demo mode is explicitly enabled AND no real events exist)
  useEffect(() => {
    if (!isDemoMode || repositories.length === 0 || liveEvents.length > 0) return
    const interval = setInterval(() => {
      const types = ['push', 'pull_request', 'issues', 'workflow_run', 'star']
      const type = types[Math.floor(Math.random() * types.length)]
      const repo = repositories[Math.floor(Math.random() * repositories.length)]
      const defaultActor = { login: 'octocat', name: 'GitHub Contributor', avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150' }
      const actor = contributors.length > 0 ? contributors[Math.floor(Math.random() * contributors.length)] : defaultActor

      const titles = {
        push: 'Pushed 2 commits to main',
        pull_request: `Opened PR #${Math.floor(Math.random() * 40) + 400}: Performance boost`,
        issues: `Updated issue #${Math.floor(Math.random() * 50) + 160}`,
        workflow_run: 'CI Build passed on main',
        star: 'Starred the repository',
      }

      addLiveEvent({
        id: `evt-${Date.now()}`,
        type,
        repositoryId: repo.id,
        repositoryName: repo.fullName,
        actor: { login: actor.login, name: actor.name, avatarUrl: actor.avatarUrl },
        timestamp: new Date().toISOString(),
        title: titles[type] || 'Activity recorded',
      })
    }, 9000)

    return () => clearInterval(interval)
  }, [isDemoMode, repositories, liveEvents.length, addLiveEvent])

  // Fleet totals
  const totalStars = repositories.reduce((sum, r) => sum + (r.stars || 0), 0)
  const totalOpenIssues = repositories.reduce((sum, r) => sum + (r.openIssues || 0), 0)
  const avgHealth = repositories.length > 0
    ? Math.round(repositories.reduce((sum, r) => sum + (r.healthScore || 85), 0) / repositories.length)
    : 0

  return (
    <div className="space-y-6">
      {/* Top Banner Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
              <span>{getGreeting()}, Abhi</span>
              <span className="text-xl">👋</span>
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Fleet Online
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real-time telemetry and health monitoring across {repositories.length} connected engineering repositories.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => navigate('/reports')}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-300 bg-slate-900/80 hover:bg-slate-800 border border-white/10 hover:border-white/20 transition-all shadow-sm"
          >
            <FileText className="w-3.5 h-3.5" />
            Audit Report
          </button>
          <button
            onClick={() => navigate('/repositories')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 shadow-md shadow-indigo-500/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Repository
          </button>
        </div>
      </div>

      {/* 3 Metric KPI Cards - Responsive Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

        {/* Card 2: Monitored Repos */}
        <div className="p-5 rounded-2xl glass-card-interactive relative overflow-hidden group">
          <div className="flex items-start justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <FolderGit2 className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">Active</span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white tracking-tight">{repositories.length}</div>
          <div className="text-xs text-slate-400 mt-1 font-medium">Connected Repositories</div>
          <div className="text-[11px] text-slate-400 mt-0.5">★ {formatNumber(totalStars)} cumulative stars</div>
        </div>

        {/* Card 3: Active Contributors (Replacing PR Latency) */}
        <div className="p-5 rounded-2xl glass-card-interactive relative overflow-hidden group">
          <div className="flex items-start justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-violet-400 tracking-tight">{contributors.length}</div>
          <div className="text-xs text-slate-400 mt-1 font-medium">Active Contributors</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Across all tracked repos</div>
        </div>

        {/* Card 4: Open Issues */}
        <div className="p-5 rounded-2xl glass-card-interactive relative overflow-hidden group">
          <div className="flex items-start justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <CircleDot className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white tracking-tight">{totalOpenIssues}</div>
          <div className="text-xs text-slate-400 mt-1 font-medium">Open Fleet Issues</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Currently active</div>
        </div>
      </div>

      {/* Middle Section: Live Activity Stream */}
      <div className="grid grid-cols-1 gap-6">
        {/* Live Activity Feed */}
        <div className="p-6 rounded-2xl glass-card space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-indigo-400" />
                Live Telemetry Stream
              </h3>
              <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-live" />
                STREAMING
              </span>
            </div>
            <Link to="/activity" className="text-xs text-indigo-400 hover:underline font-semibold">
              Full Stream →
            </Link>
          </div>

          <div className="divide-y divide-white/[0.06]">
            {liveEvents.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-400">
                No telemetry recorded yet across the fleet.
              </div>
            ) : (
              liveEvents.slice(0, 6).map((evt) => (
                <div
                  key={evt.id}
                  className="py-3 flex items-center justify-between gap-3 text-xs hover:bg-white/[0.02] px-2 rounded-xl transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={evt.actor?.avatarUrl || `https://github.com/${evt.actor?.login || 'ghost'}.png`}
                      alt={evt.actor?.name || 'Developer'}
                      className="w-8 h-8 rounded-full border border-white/10 shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-slate-100 truncate">
                          {evt.actor?.name || evt.actor?.login || 'Developer'}
                        </span>
                        {evt.teamName && (
                          <span className="px-1.5 py-0.5 text-[10px] rounded font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                            {evt.teamName}
                          </span>
                        )}
                        <span className="text-[11px] font-mono text-slate-400">
                          in <span className="text-indigo-400 font-semibold">{evt.repositoryName}</span>
                        </span>
                        {evt.branch && (
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-900 text-slate-400 border border-white/10">
                            {evt.branch}
                          </span>
                        )}
                      </div>
                      <p className="text-slate-300 text-xs mt-0.5 truncate max-w-xl">
                        {evt.description || evt.title}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 text-right">
                    {(evt.linesAdded > 0 || evt.linesDeleted > 0) && (
                      <div className="hidden sm:flex items-center gap-1.5 text-[11px] font-mono">
                        {evt.linesAdded > 0 && <span className="text-emerald-400">+{evt.linesAdded}</span>}
                        {evt.linesDeleted > 0 && <span className="text-rose-400">-{evt.linesDeleted}</span>}
                      </div>
                    )}
                    {evt.commitSha && (
                      <span className="hidden md:inline-block px-1.5 py-0.5 rounded font-mono text-[10px] bg-slate-800/80 text-slate-300 border border-white/10">
                        {evt.commitSha}
                      </span>
                    )}
                    <span className="text-[11px] font-mono text-slate-500 whitespace-nowrap">
                      {formatRelativeTime(evt.timestamp)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>



      {/* Fleet Repositories & Contributor Leaderboard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Repositories Matrix (Col Span 2) */}
        <div className="lg:col-span-2 p-6 rounded-2xl glass-card space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <FolderGit2 className="w-4 h-4 text-primary" />
              Repository Fleet Status
            </h3>
            <Link to="/repositories" className="text-xs text-indigo-400 hover:underline font-semibold">
              View all {repositories.length} repos →
            </Link>
          </div>

          <div className="divide-y divide-white/[0.06]">
            {repositories.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                No repositories connected yet. Click "Add Repositories" to import teams.
              </div>
            ) : (
              repositories.slice(0, 4).map((repo) => (
              <div key={repo.id} className="py-3.5 flex items-center justify-between gap-4">
                <div>
                  <Link
                    to={`/repositories/${repo.owner}/${repo.name}`}
                    className="text-xs sm:text-sm font-bold text-white hover:text-indigo-400 transition-colors"
                  >
                    {repo.fullName}
                  </Link>
                  <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                    <span>{repo.language}</span>
                    <span>•</span>
                    <span>★ {formatNumber(repo.stars)}</span>
                    <span>•</span>
                    <span>{repo.openIssues} open issues</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    {repo.healthScore} / 100
                  </span>
                  <Link
                    to={`/repositories/${repo.owner}/${repo.name}`}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06]"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            )))}
          </div>
        </div>

        {/* Contributor Leaderboard (Col Span 1) */}
        <div className="p-6 rounded-2xl glass-card space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-400" />
              Top Contributors
            </h3>
            <Link to="/contributors" className="text-xs text-indigo-400 hover:underline font-semibold">
              Leaderboard →
            </Link>
          </div>

          <div className="space-y-3">
            {contributors.slice(0, 4).map((c, i) => (
              <div
                key={c.id}
                className="p-3 rounded-xl bg-slate-900/60 border border-white/[0.06] flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <div className="relative">
                    <img src={c.avatarUrl} alt={c.name || c.login} className="w-8 h-8 rounded-full border border-white/10" />
                    <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-slate-950 border border-white/10 text-[9px] font-bold text-slate-300 flex items-center justify-center">
                      {i + 1}
                    </span>
                  </div>
                  <div>
                    <div className="font-bold text-slate-200">{c.name || c.login}</div>
                    <div className="text-[11px] text-slate-400">{c.commits || c.totalCommits || 0} commits</div>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-xs text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                  <Flame className="w-3.5 h-3.5 fill-amber-400" />
                  <span>{c.currentStreak}d</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
