import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { formatNumber, formatRelativeTime, getGreeting } from '../lib/utils'
import {
  mockRepositories,
  mockContributors,
  mockActivityEvents,
  mockHealthScores,
  generateTimeSeriesData,
} from '../data/mock'
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
  const { liveEvents, addLiveEvent } = useRealtimeStore()
  const [chartPeriod, setChartPeriod] = useState('30')
  const chartData = generateTimeSeriesData(parseInt(chartPeriod, 10))

  // Simulated live event injector
  useEffect(() => {
    const interval = setInterval(() => {
      const types = ['push', 'pull_request', 'issues', 'workflow_run', 'star']
      const type = types[Math.floor(Math.random() * types.length)]
      const repo = mockRepositories[Math.floor(Math.random() * mockRepositories.length)]
      const actor = mockContributors[Math.floor(Math.random() * mockContributors.length)]

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
  }, [addLiveEvent])

  // Fleet totals
  const totalStars = mockRepositories.reduce((sum, r) => sum + r.stars, 0)
  const totalOpenIssues = mockRepositories.reduce((sum, r) => sum + r.openIssues, 0)
  const avgHealth = Math.round(
    mockRepositories.reduce((sum, r) => sum + (r.healthScore || 85), 0) / mockRepositories.length
  )

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
            Real-time telemetry and health monitoring across {mockRepositories.length} connected engineering repositories.
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

      {/* 4 Metric KPI Cards - Responsive Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Health */}
        <div className="p-5 rounded-2xl glass-card-interactive relative overflow-hidden group">
          <div className="flex items-start justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <span className="flex items-center gap-1 text-xs font-bold text-emerald-400 font-mono">
              +4.2%
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white tracking-tight">{avgHealth} <span className="text-sm font-normal text-slate-400">/ 100</span></div>
          <div className="text-xs text-slate-400 mt-1 font-medium">Fleet Health Score</div>
          <div className="text-[11px] text-emerald-400 mt-0.5 font-medium">Optimal resilience status</div>
        </div>

        {/* Card 2: Monitored Repos */}
        <div className="p-5 rounded-2xl glass-card-interactive relative overflow-hidden group">
          <div className="flex items-start justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <FolderGit2 className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">Active</span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white tracking-tight">{mockRepositories.length}</div>
          <div className="text-xs text-slate-400 mt-1 font-medium">Connected Repositories</div>
          <div className="text-[11px] text-slate-400 mt-0.5">★ {formatNumber(totalStars)} cumulative stars</div>
        </div>

        {/* Card 3: PR Review Latency */}
        <div className="p-5 rounded-2xl glass-card-interactive relative overflow-hidden group">
          <div className="flex items-start justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
              <GitPullRequest className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-emerald-400 font-mono">-38% delay</span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-violet-400 tracking-tight">2.4h</div>
          <div className="text-xs text-slate-400 mt-1 font-medium">Average Review Latency</div>
          <div className="text-[11px] text-slate-400 mt-0.5">14 active pull requests</div>
        </div>

        {/* Card 4: Open Issues */}
        <div className="p-5 rounded-2xl glass-card-interactive relative overflow-hidden group">
          <div className="flex items-start justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <CircleDot className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Low Churn</span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white tracking-tight">{totalOpenIssues}</div>
          <div className="text-xs text-slate-400 mt-1 font-medium">Open Fleet Issues</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Avg resolution &lt; 24h</div>
        </div>
      </div>

      {/* Middle Section: Health Score Breakdown + Live Activity Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Health Score Deep-Dive (Col Span 1) */}
        <div className="p-6 rounded-2xl glass-card space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Pulse Health Dimensions
            </h3>
            <span className="text-xs font-mono text-emerald-400 font-bold">{avgHealth} / 100</span>
          </div>

          {/* Dimension Bars */}
          <div className="space-y-3 pt-2">
            {[
              { label: 'Commit Velocity', val: 23, max: 25, color: 'bg-emerald-400' },
              { label: 'PR Responsiveness', val: 18, max: 20, color: 'bg-indigo-400' },
              { label: 'CI Pipeline Health', val: 19, max: 20, color: 'bg-cyan-400' },
              { label: 'Bus Factor Distribution', val: 13, max: 15, color: 'bg-purple-400' },
              { label: 'Community Vitality', val: 9, max: 10, color: 'bg-pink-400' },
              { label: 'Security & Dependencies', val: 10, max: 10, color: 'bg-emerald-400' },
            ].map((d) => (
              <div key={d.label} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300 font-medium">{d.label}</span>
                  <span className="font-mono text-slate-400 text-[11px]">
                    {d.val} / {d.max}
                  </span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${d.color} transition-all duration-700`}
                    style={{ width: `${(d.val / d.max) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-slate-300">
            <strong className="text-indigo-300">Recommendation:</strong> Review incoming PRs on `the-grocery-hub` to maintain sub-2h velocity.
          </div>
        </div>

        {/* Live Activity Feed (Col Span 2) */}
        <div className="lg:col-span-2 p-6 rounded-2xl glass-card space-y-4">
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
            {liveEvents.slice(0, 5).map((evt) => (
              <div key={evt.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={evt.actor.avatarUrl}
                    alt={evt.actor.name}
                    className="w-7 h-7 rounded-full border border-white/10 shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-200 truncate">
                      {evt.actor.name}{' '}
                      <span className="font-normal text-slate-400">— {evt.title}</span>
                    </p>
                    <span className="text-[11px] font-mono text-indigo-400 truncate block">
                      {evt.repositoryName}
                    </span>
                  </div>
                </div>

                <span className="text-[11px] font-mono text-slate-500 whitespace-nowrap shrink-0">
                  {formatRelativeTime(evt.timestamp)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Code Velocity & Churn Chart */}
      <div className="p-6 rounded-2xl glass-card space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-indigo-400" />
              Engineering Code Velocity & Churn
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Daily commits, additions, and deletions across all fleet repositories
            </p>
          </div>

          <div className="flex items-center gap-2">
            {['7', '30', '90'].map((period) => (
              <button
                key={period}
                onClick={() => setChartPeriod(period)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  chartPeriod === period
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-900 text-slate-400 hover:text-white'
                }`}
              >
                {period}D
              </button>
            ))}
          </div>
        </div>

        <div className="h-64 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="commitsGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="date" stroke="#64748b" fontSize={11} tickLine={false} />
              <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0b1120',
                  borderColor: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '0.75rem',
                  color: '#fff',
                  fontSize: '12px',
                }}
              />
              <Area
                type="monotone"
                dataKey="commits"
                stroke="#6366f1"
                strokeWidth={2.5}
                fill="url(#commitsGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
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
              View all {mockRepositories.length} repos →
            </Link>
          </div>

          <div className="divide-y divide-white/[0.06]">
            {mockRepositories.slice(0, 4).map((repo) => (
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
            ))}
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
            {mockContributors.slice(0, 4).map((c, i) => (
              <div
                key={c.id}
                className="p-3 rounded-xl bg-slate-900/60 border border-white/[0.06] flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <div className="relative">
                    <img src={c.avatarUrl} alt={c.name} className="w-8 h-8 rounded-full border border-white/10" />
                    <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-slate-950 border border-white/10 text-[9px] font-bold text-slate-300 flex items-center justify-center">
                      {i + 1}
                    </span>
                  </div>
                  <div>
                    <div className="font-bold text-slate-200">{c.name}</div>
                    <div className="text-[11px] text-slate-400">{c.commits} commits</div>
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
