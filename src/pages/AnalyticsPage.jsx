import { useState, useMemo } from 'react'
import {
  generateTimeSeriesData,
} from '../data/mock'
import { formatNumber } from '../lib/utils'
import {
  BarChart3,
  TrendingUp,
  GitCommit,
  ShieldCheck,
  Activity,
  Code2,
  Calendar,
} from 'lucide-react'
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  LineChart,
  Line,
} from 'recharts'

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState('30') // '7' | '30' | '90'

  const timeSeriesData = useMemo(() => {
    return generateTimeSeriesData(parseInt(timeRange, 10))
  }, [timeRange])

  // Total additions & deletions in window
  const totals = useMemo(() => {
    const totalAdditions = timeSeriesData.reduce((acc, d) => acc + d.additions, 0)
    const totalDeletions = timeSeriesData.reduce((acc, d) => acc + d.deletions, 0)
    const totalCommits = timeSeriesData.reduce((acc, d) => acc + d.commits, 0)
    return { totalAdditions, totalDeletions, totalCommits }
  }, [timeSeriesData])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <BarChart3 className="w-7 h-7 text-indigo-400" />
            Engineering Velocity & Analytics
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Deep telemetry on code churn, commit cadence, star trajectory, and engineering velocity.
          </p>
        </div>

        {/* Time range switcher */}
        <div className="flex items-center gap-2">
          <div className="flex items-center p-1 rounded-xl bg-slate-900/80 border border-white/10 text-xs">
            {[
              { id: '7', label: 'Last 7 Days' },
              { id: '30', label: 'Last 30 Days' },
              { id: '90', label: 'Last Quarter' },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setTimeRange(t.id)}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                  timeRange === t.id
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 sm:p-5 rounded-2xl glass-card">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Total Commits</span>
            <GitCommit className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white font-mono">{formatNumber(totals.totalCommits)}</div>
          <span className="text-[11px] text-emerald-400 font-medium">+14% vs previous window</span>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl glass-card">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Code Additions</span>
            <Code2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono">+{formatNumber(totals.totalAdditions)}</div>
          <span className="text-[11px] text-slate-400 font-medium">New lines written</span>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl glass-card">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Code Deletions</span>
            <Code2 className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-rose-400 font-mono">-{formatNumber(totals.totalDeletions)}</div>
          <span className="text-[11px] text-slate-400 font-medium">Refactor & tech debt payoff</span>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl glass-card">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Fleet Health</span>
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white font-mono">94.2</div>
          <span className="text-[11px] text-emerald-400 font-medium">Optimal stability</span>
        </div>
      </div>

      {/* Chart 1: Code Churn (Additions vs Deletions) */}
      <div className="p-6 rounded-2xl glass-card space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-indigo-400" />
              Code Churn & Refactoring Volume
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Daily lines added versus lines deleted across all monitored fleet repositories
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs font-medium">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-xs bg-emerald-400" />
              <span className="text-slate-300">Additions (+)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-xs bg-rose-500" />
              <span className="text-slate-300">Deletions (-)</span>
            </div>
          </div>
        </div>

        <div className="h-72 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={timeSeriesData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="additionsGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="deletionsGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
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
                dataKey="additions"
                stroke="#10b981"
                strokeWidth={2}
                fill="url(#additionsGradient)"
              />
              <Area
                type="monotone"
                dataKey="deletions"
                stroke="#f43f5e"
                strokeWidth={2}
                fill="url(#deletionsGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Grid: Commit Velocity + Stars Growth */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 2: Daily Commit Velocity */}
        <div className="p-6 rounded-2xl glass-card space-y-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-indigo-400" />
              Daily Commit Velocity
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Volume of commits pushed per day over the selected window
            </p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={timeSeriesData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
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
                <Bar dataKey="commits" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Star Growth Curve */}
        <div className="p-6 rounded-2xl glass-card space-y-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-amber-400" />
              Cumulative Star Trajectory
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Community engagement and star acceleration curve
            </p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timeSeriesData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
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
                <Line
                  type="monotone"
                  dataKey="stars"
                  stroke="#f59e0b"
                  strokeWidth={2.5}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
}
