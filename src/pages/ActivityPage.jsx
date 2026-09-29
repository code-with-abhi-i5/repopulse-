import { useState, useMemo, useEffect } from 'react'
import { mockActivityEvents, mockRepositories, contributorRefs } from '../data/mock'
import { formatRelativeTime } from '../lib/utils'
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
} from 'lucide-react'

const eventTypeIcons = {
  push: { icon: GitCommit, color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/20', label: 'Push' },
  pull_request: { icon: GitPullRequest, color: 'text-purple-500', bg: 'bg-purple-500/10', border: 'border-purple-500/20', label: 'Pull Request' },
  issues: { icon: AlertCircle, color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/20', label: 'Issue' },
  workflow_run: { icon: Activity, color: 'text-rose-500', bg: 'bg-rose-500/10', border: 'border-rose-500/20', label: 'Workflow' },
  star: { icon: Star, color: 'text-yellow-500', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20', label: 'Star' },
  release: { icon: Tag, color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', label: 'Release' },
  fork: { icon: GitFork, color: 'text-cyan-500', bg: 'bg-cyan-500/10', border: 'border-cyan-500/20', label: 'Fork' },
}

export default function ActivityPage() {
  const { liveEvents, isConnected, addLiveEvent } = useRealtimeStore()
  const [events, setEvents] = useState(mockActivityEvents)
  const [selectedType, setSelectedType] = useState('all')
  const [selectedRepo, setSelectedRepo] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [isLivePaused, setIsLivePaused] = useState(false)
  const [eventCount, setEventCount] = useState(mockActivityEvents.length)

  // Periodic event injector when live is not paused
  useEffect(() => {
    if (isLivePaused) return

    const interval = setInterval(() => {
      const types = ['push', 'pull_request', 'issues', 'workflow_run', 'star']
      const randomType = types[Math.floor(Math.random() * types.length)]
      const randomRepo = mockRepositories[Math.floor(Math.random() * mockRepositories.length)]
      const randomActor = contributorRefs[Math.floor(Math.random() * contributorRefs.length)]

      const titles = {
        push: 'Pushed 2 commits to main',
        pull_request: `Opened PR #${Math.floor(Math.random() * 50) + 400}: Performance optimization`,
        issues: `Updated issue #${Math.floor(Math.random() * 50) + 150}: Edge case handling`,
        workflow_run: 'CI Build passed on main',
        star: 'Starred the repository',
      }

      const newEvent = {
        id: `evt-${Date.now()}`,
        type: randomType,
        repositoryId: randomRepo.id,
        repositoryName: randomRepo.fullName,
        actor: randomActor,
        timestamp: new Date().toISOString(),
        title: titles[randomType] || 'Updated repository status',
        description: 'Automated telemetry stream',
      }

      setEvents((prev) => [newEvent, ...prev.slice(0, 40)])
      setEventCount((c) => c + 1)
      addLiveEvent(newEvent)
    }, 7000)

    return () => clearInterval(interval)
  }, [isLivePaused, addLiveEvent])

  // Filtered event list
  const filteredEvents = useMemo(() => {
    return events.filter((e) => {
      const matchType = selectedType === 'all' || e.type === selectedType
      const matchRepo = selectedRepo === 'all' || e.repositoryName === selectedRepo
      const matchSearch =
        e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.actor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.repositoryName.toLowerCase().includes(searchQuery.toLowerCase())
      return matchType && matchRepo && matchSearch
    })
  }, [events, selectedType, selectedRepo, searchQuery])

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <Activity className="w-7 h-7 text-primary" />
            Live Activity Feed
            <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Live Stream
            </span>
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Real-time webhook and event telemetry streaming across all connected repositories.
          </p>
        </div>

        {/* Live Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsLivePaused((prev) => !prev)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium border transition-colors ${
              isLivePaused
                ? 'bg-amber-500/10 text-amber-500 border-amber-500/20 hover:bg-amber-500/20'
                : 'bg-secondary text-foreground border-border hover:bg-secondary/80'
            }`}
          >
            {isLivePaused ? (
              <>
                <Play className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
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

      {/* Filter and Control Bar */}
      <div className="p-4 rounded-xl bg-card border border-border/80 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Filter by actor, commit, issue or repository..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm rounded-lg bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all text-foreground placeholder:text-muted-foreground"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2.5">
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-background border border-border text-foreground text-xs focus:outline-none focus:ring-1 focus:ring-primary"
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

          <select
            value={selectedRepo}
            onChange={(e) => setSelectedRepo(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-background border border-border text-foreground text-xs focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="all">All Repositories</option>
            {mockRepositories.map((r) => (
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
          <div className="p-12 text-center rounded-2xl bg-card border border-border text-muted-foreground">
            No events match your selected filters.
          </div>
        ) : (
          filteredEvents.map((evt, idx) => {
            const config = eventTypeIcons[evt.type] || eventTypeIcons.push
            const Icon = config.icon

            return (
              <div
                key={evt.id}
                className={`p-4 rounded-xl bg-card border border-border/80 hover:border-primary/40 transition-all duration-300 shadow-xs flex items-start justify-between gap-4 ${
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
                    src={evt.actor.avatarUrl}
                    alt={evt.actor.name}
                    className="w-9 h-9 rounded-full border border-border shrink-0 mt-0.5"
                  />

                  {/* Event Details */}
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-foreground">{evt.actor.name}</span>
                      <span className="text-xs text-muted-foreground">in</span>
                      <span className="text-xs font-semibold text-primary font-mono">{evt.repositoryName}</span>
                      <span className={`px-2 py-0.2 rounded-full text-[10px] font-semibold uppercase tracking-wider ${config.bg} ${config.color}`}>
                        {config.label}
                      </span>
                    </div>

                    <p className="text-sm font-medium text-foreground mt-1 leading-snug">
                      {evt.title}
                    </p>

                    {evt.description && (
                      <p className="text-xs text-muted-foreground mt-0.5 font-mono">
                        {evt.description}
                      </p>
                    )}
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
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
