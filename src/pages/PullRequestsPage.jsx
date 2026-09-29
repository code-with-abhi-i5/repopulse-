import { useState, useMemo } from 'react'
import { mockPullRequests, mockRepositories } from '../data/mock'
import { formatRelativeTime } from '../lib/utils'
import {
  GitPullRequest,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Filter,
  ArrowUpRight,
  GitMerge,
  Users,
  AlertCircle,
  FileCode,
} from 'lucide-react'

export default function PullRequestsPage() {
  const [pullRequests] = useState(mockPullRequests)
  const [selectedState, setSelectedState] = useState('all') // 'all' | 'open' | 'merged' | 'closed'
  const [selectedRepo, setSelectedRepo] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  // PR Metrics
  const metrics = useMemo(() => {
    const total = pullRequests.length
    const open = pullRequests.filter((p) => p.state === 'open').length
    const merged = pullRequests.filter((p) => p.state === 'merged').length
    const withLatency = pullRequests.filter((p) => p.reviewLatencyHours != null)
    const avgLatency =
      withLatency.length > 0
        ? (withLatency.reduce((acc, p) => acc + (p.reviewLatencyHours || 0), 0) / withLatency.length).toFixed(1)
        : '3.4'
    const mergeRate = Math.round((merged / (total || 1)) * 100)

    return { total, open, merged, avgLatency, mergeRate }
  }, [pullRequests])

  // Filtered PRs
  const filteredPRs = useMemo(() => {
    return pullRequests.filter((pr) => {
      const matchState = selectedState === 'all' || pr.state === selectedState
      const matchRepo = selectedRepo === 'all' || pr.repositoryId === selectedRepo
      const matchSearch =
        pr.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pr.author.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        String(pr.number).includes(searchQuery)
      return matchState && matchRepo && matchSearch
    })
  }, [pullRequests, selectedState, selectedRepo, searchQuery])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <GitPullRequest className="w-7 h-7 text-primary" />
            Pull Request Intelligence
            <span className="text-xs px-2.5 py-0.5 rounded-full font-medium bg-primary/10 text-primary border border-primary/20">
              {metrics.total} Tracked
            </span>
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Analyze review bottlenecks, merge velocity, code review turnaround, and PR lifecycles.
          </p>
        </div>
      </div>

      {/* KPI Cards Banner */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-card border border-border shadow-xs">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
            <span>Average Review Latency</span>
            <Clock className="w-4 h-4 text-primary" />
          </div>
          <div className="text-2xl font-bold text-foreground">{metrics.avgLatency}h</div>
          <span className="text-[11px] text-emerald-500 font-medium">18% faster than baseline</span>
        </div>

        <div className="p-4 rounded-xl bg-card border border-border shadow-xs">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
            <span>Merge Success Rate</span>
            <GitMerge className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-2xl font-bold text-foreground">{metrics.mergeRate}%</div>
          <span className="text-[11px] text-muted-foreground font-medium">High merge stability</span>
        </div>

        <div className="p-4 rounded-xl bg-card border border-border shadow-xs">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
            <span>Open Pull Requests</span>
            <GitPullRequest className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-foreground">{metrics.open}</div>
          <span className="text-[11px] text-muted-foreground font-medium">Awaiting final review</span>
        </div>

        <div className="p-4 rounded-xl bg-card border border-border shadow-xs">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
            <span>Merged Pull Requests</span>
            <CheckCircle2 className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-bold text-foreground">{metrics.merged}</div>
          <span className="text-[11px] text-emerald-500 font-medium">Shipped to main</span>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="p-4 rounded-xl bg-card border border-border/80 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by title, PR #, or author..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm rounded-lg bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all text-foreground placeholder:text-muted-foreground"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Status Tabs */}
          <div className="flex items-center p-0.5 rounded-lg bg-secondary border border-border text-xs">
            {['all', 'open', 'merged', 'closed'].map((s) => (
              <button
                key={s}
                onClick={() => setSelectedState(s)}
                className={`px-3 py-1.5 rounded-md font-medium capitalize transition-colors ${
                  selectedState === s
                    ? 'bg-background text-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          {/* Repo selector */}
          <select
            value={selectedRepo}
            onChange={(e) => setSelectedRepo(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-background border border-border text-foreground text-xs focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="all">All Repositories</option>
            {mockRepositories.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* PR List */}
      <div className="divide-y divide-border/60 rounded-2xl bg-card border border-border shadow-xs overflow-hidden">
        {filteredPRs.length === 0 ? (
          <div className="p-12 text-center text-sm text-muted-foreground">
            No pull requests found matching the current criteria.
          </div>
        ) : (
          filteredPRs.map((pr) => {
            const isMerged = pr.state === 'merged'
            const isOpen = pr.state === 'open'
            const isClosed = pr.state === 'closed'

            return (
              <div
                key={pr.id}
                className="p-4 hover:bg-muted/30 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-3.5 min-w-0">
                  {/* Status Icon */}
                  <div
                    className={`mt-1 p-1.5 rounded-lg shrink-0 ${
                      isOpen
                        ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                        : isMerged
                        ? 'bg-purple-500/10 text-purple-500 border border-purple-500/20'
                        : 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                    }`}
                  >
                    <GitPullRequest className="w-4 h-4" />
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <a
                        href={pr.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm font-semibold text-foreground hover:text-primary transition-colors"
                      >
                        {pr.title}
                      </a>
                      <span className="text-xs text-muted-foreground font-mono">#{pr.number}</span>
                      {pr.isDraft && (
                        <span className="px-2 py-0.2 rounded text-[10px] font-semibold bg-muted text-muted-foreground border border-border">
                          Draft
                        </span>
                      )}
                      {pr.labels?.map((label) => (
                        <span
                          key={label.name}
                          className="px-2 py-0.2 rounded text-[10px] font-medium"
                          style={{
                            backgroundColor: `${label.color}15`,
                            color: label.color,
                            border: `1px solid ${label.color}40`,
                          }}
                        >
                          {label.name}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1.5 flex-wrap">
                      <div className="flex items-center gap-1.5">
                        <img
                          src={pr.author.avatarUrl}
                          alt={pr.author.name}
                          className="w-4 h-4 rounded-full border border-border"
                        />
                        <span className="font-medium text-foreground">{pr.author.name}</span>
                      </div>
                      <span>•</span>
                      <span>created {formatRelativeTime(pr.createdAt)}</span>
                      {pr.reviewLatencyHours && (
                        <>
                          <span>•</span>
                          <span className="text-primary font-medium">
                            Review latency: {pr.reviewLatencyHours.toFixed(1)}h
                          </span>
                        </>
                      )}
                      {pr.mergeTimeHours && (
                        <>
                          <span>•</span>
                          <span className="text-purple-400 font-medium">
                            Merged in {pr.mergeTimeHours.toFixed(1)}h
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right side stats */}
                <div className="flex items-center gap-4 shrink-0 self-end md:self-center">
                  {/* Reviewers */}
                  {pr.reviewers && pr.reviewers.length > 0 && (
                    <div className="flex -space-x-1.5" title="Assigned reviewers">
                      {pr.reviewers.map((rev, i) => (
                        <img
                          key={i}
                          src={rev.avatarUrl}
                          alt={rev.name}
                          className="w-6 h-6 rounded-full border border-background"
                        />
                      ))}
                    </div>
                  )}

                  {/* Churn badge */}
                  <div className="flex items-center gap-1.5 font-mono text-xs">
                    <span className="text-emerald-500 font-semibold">+{pr.additions}</span>
                    <span className="text-rose-500 font-semibold">-{pr.deletions}</span>
                  </div>

                  {/* External link */}
                  <a
                    href={pr.url}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                  >
                    <ArrowUpRight className="w-4 h-4" />
                  </a>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
