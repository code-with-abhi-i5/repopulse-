import { useState, useMemo, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../lib/api'
import { formatNumber, formatRelativeTime } from '../lib/utils'
import { useRealtimeStore } from '../stores'
import {
  Activity,
  GitCommit,
  GitPullRequest,
  AlertCircle,
  Star,
  Tag,
  GitFork,
  Radio,
  Play,
  Pause,
  Filter,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Flame,
  Search,
  Sparkles,
  Users,
  FolderGit2,
  GitBranch,
  ArrowUpRight,
  Code2,
  Layers,
  ShieldCheck,
} from 'lucide-react'

const eventTypeIcons = {
  push: { icon: GitCommit, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20', label: 'Push' },
  pull_request: { icon: GitPullRequest, color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20', label: 'Pull Request' },
  issues: { icon: AlertCircle, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20', label: 'Issue' },
  workflow_run: { icon: Activity, color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/20', label: 'Workflow' },
  star: { icon: Star, color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20', label: 'Star' },
  release: { icon: Tag, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', label: 'Release' },
  fork: { icon: GitFork, color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/20', label: 'Fork' },
}

export default function ActivityPage() {
  const { liveEvents, isConnected, addLiveEvent } = useRealtimeStore()
  const [events, setEvents] = useState([])
  const [repositories, setRepositories] = useState([])
  const [selectedType, setSelectedType] = useState('all')
  const [selectedRepo, setSelectedRepo] = useState('all')
  const [selectedTeam, setSelectedTeam] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [isLivePaused, setIsLivePaused] = useState(false)

  useEffect(() => {
    api.getActivities().then((data) => setEvents(data || [])).catch(() => setEvents([]))
    api.getRepositories().then((data) => setRepositories(data || [])).catch(() => setRepositories([]))
  }, [])

  // Unique teams from repos and events
  const uniqueTeams = useMemo(() => {
    const teams = new Set()
    repositories.forEach((r) => r.teamName && teams.add(r.teamName))
    events.forEach((e) => e.teamName && teams.add(e.teamName))
    return ['all', ...Array.from(teams)]
  }, [events, repositories])

  // Merge live events into event list
  useEffect(() => {
    if (liveEvents.length > 0 && !isLivePaused) {
      setEvents((prev) => {
        const existingIds = new Set(prev.map(e => e.id))
        const newOnes = liveEvents.filter(e => !existingIds.has(e.id))
        return [...newOnes, ...prev].slice(0, 100)
      })
    }
  }, [liveEvents, isLivePaused])

  // Real-time telemetry summary metrics
  const telemetryStats = useMemo(() => {
    let totalPushes = 0
    let totalAdditions = 0
    let totalDeletions = 0
    const activeTeams = new Set()

    events.forEach((e) => {
      const type = (e.type || '').toLowerCase()
      if (type === 'push') totalPushes += e.commitCount || 1
      if (e.linesAdded) totalAdditions += e.linesAdded
      if (e.linesDeleted) totalDeletions += e.linesDeleted
      if (e.teamName) activeTeams.add(e.teamName)
    })

    return {
      totalPushes,
      totalAdditions,
      totalDeletions,
      activeTeamsCount: activeTeams.size,
    }
  }, [events])

  // Filtered event list
  const filteredEvents = useMemo(() => {
    return events.filter((e) => {
      const type = (e.type || '').toLowerCase()
      const matchType = selectedType === 'all' || type === selectedType.toLowerCase()
      const matchRepo = selectedRepo === 'all' || e.repositoryName === selectedRepo
      const matchTeam = selectedTeam === 'all' || e.teamName === selectedTeam
      const matchSearch =
        (e.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (e.actor?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (e.repositoryName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (e.teamName && e.teamName.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (e.description && e.description.toLowerCase().includes(searchQuery.toLowerCase()))
      return matchType && matchRepo && matchTeam && matchSearch
    })
  }, [events, selectedType, selectedRepo, selectedTeam, searchQuery])

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5 flex-wrap">
            <Activity className="w-7 h-7 text-indigo-400" />
            Live Activity & Telemetry Stream
            <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Live Telemetry Active
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Tracking personal contributor pushes, targeted repositories, and line-level code churn across all teams.
          </p>
        </div>

        {/* Live Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsLivePaused((prev) => !prev)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all ${
              isLivePaused
                ? 'bg-amber-500/10 text-amber-400 border-amber-500/20 hover:bg-amber-500/20'
                : 'bg-slate-900 text-slate-200 border-white/10 hover:bg-slate-800'
            }`}
          >
            {isLivePaused ? (
              <>
                <Play className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                Resume Stream
              </>
            ) : (
              <>
                <Pause className="w-3.5 h-3.5" />
                Pause Stream
              </>
            )}
          </button>
        </div>
      </div>

      {/* Real-Time Live Churn & Push Telemetry KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Pushes */}
        <div className="p-4 rounded-2xl glass-card flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <GitCommit className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-medium text-slate-400 block uppercase tracking-wider">
              Pushes Tracked
            </span>
            <span className="text-xl font-bold font-mono text-white">
              {telemetryStats.totalPushes} Pushes
            </span>
          </div>
        </div>

        {/* Lines Added */}
        <div className="p-4 rounded-2xl glass-card flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Code2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-medium text-slate-400 block uppercase tracking-wider">
              Lines Added
            </span>
            <span className="text-xl font-bold font-mono text-emerald-400">
              +{formatNumber(telemetryStats.totalAdditions)}
            </span>
          </div>
        </div>

        {/* Lines Deleted */}
        <div className="p-4 rounded-2xl glass-card flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-medium text-slate-400 block uppercase tracking-wider">
              Lines Deleted
            </span>
            <span className="text-xl font-bold font-mono text-rose-400">
              -{formatNumber(telemetryStats.totalDeletions)}
            </span>
          </div>
        </div>

        {/* Active Teams */}
        <div className="p-4 rounded-2xl glass-card flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-medium text-slate-400 block uppercase tracking-wider">
              Active Teams
            </span>
            <span className="text-xl font-bold font-mono text-purple-300">
              {telemetryStats.activeTeamsCount} Teams
            </span>
          </div>
        </div>
      </div>

      {/* Filter and Control Bar */}
      <div className="p-4 rounded-2xl glass-card flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by contributor, team, repo, or commit..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm rounded-xl bg-slate-950/60 border border-white/10 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all text-white placeholder:text-slate-500"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Team Filter */}
          <select
            value={selectedTeam}
            onChange={(e) => setSelectedTeam(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-slate-900 border border-white/10 text-white text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            {uniqueTeams.map((team) => (
              <option key={team} value={team}>
                {team === 'all' ? 'All Teams' : team}
              </option>
            ))}
          </select>

          {/* Type Filter */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-slate-900 border border-white/10 text-white text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="all">All Event Types</option>
            <option value="push">Pushes & Commits</option>
            <option value="pull_request">Pull Requests</option>
            <option value="issues">Issues</option>
            <option value="workflow_run">CI Workflows</option>
            <option value="star">Stars</option>
            <option value="release">Releases</option>
            <option value="fork">Forks</option>
          </select>

          {/* Repository Filter */}
          <select
            value={selectedRepo}
            onChange={(e) => setSelectedRepo(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-slate-900 border border-white/10 text-white text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="all">All Repositories</option>
            {repositories.map((r) => (
              <option key={r.id} value={r.fullName}>
                {r.fullName}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Activity Timeline List */}
      <div className="space-y-3">
        {filteredEvents.length === 0 ? (
          <div className="p-12 text-center rounded-2xl glass-card text-slate-400">
            No events match your selected filters.
          </div>
        ) : (
          filteredEvents.map((evt, idx) => {
            const eventType = (evt.type || 'push').toLowerCase()
            const config = eventTypeIcons[eventType] || eventTypeIcons.push
            const Icon = config.icon

            return (
              <div
                key={evt.id}
                className={`p-4 rounded-2xl glass-card border border-white/[0.08] hover:border-indigo-500/40 transition-all duration-300 flex flex-col sm:flex-row sm:items-start justify-between gap-4 ${
                  idx === 0 && !isLivePaused ? 'animate-in fade-in slide-in-from-top-2 duration-300' : ''
                }`}
              >
                <div className="flex items-start gap-3.5 min-w-0">
                  {/* Event Type Icon badge */}
                  <div className={`p-2 rounded-xl border ${config.bg} ${config.color} ${config.border} shrink-0 mt-0.5`}>
                    <Icon className="w-4 h-4" />
                  </div>

                  {/* Actor Avatar */}
                  <img
                    src={evt.actor?.avatarUrl || `https://github.com/${evt.actor?.login || 'ghost'}.png`}
                    alt={evt.actor?.name || 'Developer'}
                    className="w-10 h-10 rounded-full border border-white/10 shrink-0 mt-0.5"
                  />

                  {/* Event Details */}
                  <div className="min-w-0 flex-1">
                    {/* Top Identity Meta: Developer + Team + Repo + Branch */}
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-xs font-bold text-white">
                        {evt.actor?.name || evt.actor?.login || 'Developer'}
                      </span>

                      {/* Team Badge */}
                      {evt.teamName && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                          <Users className="w-2.5 h-2.5 text-indigo-400" />
                          {evt.teamName}
                        </span>
                      )}

                      <span className="text-xs text-slate-500">in</span>

                      {/* Repo Badge */}
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-mono font-semibold bg-slate-900 text-slate-200 border border-white/10">
                        <FolderGit2 className="w-2.5 h-2.5 text-indigo-400" />
                        {evt.repositoryName}
                      </span>

                      {/* Branch Badge */}
                      {evt.branch && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono text-slate-400 bg-white/[0.04] border border-white/[0.08]">
                          <GitBranch className="w-2.5 h-2.5 text-slate-400" />
                          {evt.branch}
                        </span>
                      )}

                      <span className={`px-2 py-0.2 rounded-full text-[10px] font-semibold uppercase tracking-wider ${config.bg} ${config.color}`}>
                        {config.label}
                      </span>
                    </div>

                    {/* Event Title */}
                    <p className="text-sm font-semibold text-white leading-snug">
                      {evt.title}
                    </p>

                    {/* Commit Description */}
                    {evt.description && (
                      <p className="text-xs text-slate-400 mt-0.5 font-mono">
                        {evt.description}
                      </p>
                    )}

                    {/* Code Churn Granular Telemetry (Lines Added vs Lines Deleted) */}
                    {(evt.linesAdded !== undefined || evt.linesDeleted !== undefined) && (
                      <div className="flex items-center gap-2 mt-2 pt-2 border-t border-white/[0.06] text-xs flex-wrap">
                        <div className="flex items-center gap-1.5 font-mono">
                          <span className="px-2 py-0.5 rounded font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[11px]">
                            +{evt.linesAdded || 0} lines
                          </span>
                          <span className="px-2 py-0.5 rounded font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[11px]">
                            -{evt.linesDeleted || 0} lines
                          </span>
                          <span className="text-[11px] text-slate-400">
                            (Net: {(evt.linesAdded || 0) - (evt.linesDeleted || 0) >= 0 ? '+' : ''}
                            {(evt.linesAdded || 0) - (evt.linesDeleted || 0)} diff)
                          </span>
                        </div>

                        {evt.commitSha && (
                          <span className="text-[11px] font-mono text-slate-500 ml-auto">
                            SHA: #{evt.commitSha}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-xs text-slate-400 font-mono whitespace-nowrap">
                    {formatRelativeTime(evt.timestamp)}
                  </span>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
