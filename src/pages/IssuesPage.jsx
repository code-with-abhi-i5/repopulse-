import { useState, useMemo } from 'react'
import { mockIssues, mockRepositories } from '../data/mock'
import { formatRelativeTime } from '../lib/utils'
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Search,
  Filter,
  ArrowUpRight,
  Flame,
  AlertTriangle,
  Tag,
} from 'lucide-react'

export default function IssuesPage() {
  const [issues] = useState(mockIssues)
  const [selectedState, setSelectedState] = useState('all') // 'all' | 'open' | 'closed' | 'stale'
  const [selectedRepo, setSelectedRepo] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  // Metrics
  const metrics = useMemo(() => {
    const total = issues.length
    const open = issues.filter((i) => i.state === 'open').length
    const closed = issues.filter((i) => i.state === 'closed').length
    const stale = issues.filter((i) => i.isStale).length
    const withResponse = issues.filter((i) => i.firstResponseHours != null)
    const avgResponseTime =
      withResponse.length > 0
        ? (withResponse.reduce((acc, i) => acc + (i.firstResponseHours || 0), 0) / withResponse.length).toFixed(1)
        : '2.1'

    return { total, open, closed, stale, avgResponseTime }
  }, [issues])

  // Filtered issues
  const filteredIssues = useMemo(() => {
    return issues.filter((issue) => {
      let matchState = true
      if (selectedState === 'open') matchState = issue.state === 'open'
      else if (selectedState === 'closed') matchState = issue.state === 'closed'
      else if (selectedState === 'stale') matchState = issue.isStale

      const matchRepo = selectedRepo === 'all' || issue.repositoryId === selectedRepo
      const matchSearch =
        issue.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        issue.author.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        String(issue.number).includes(searchQuery)

      return matchState && matchRepo && matchSearch
    })
  }, [issues, selectedState, selectedRepo, searchQuery])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <AlertCircle className="w-7 h-7 text-primary" />
            Issue Triage & Health Monitor
            <span className="text-xs px-2.5 py-0.5 rounded-full font-medium bg-primary/10 text-primary border border-primary/20">
              {metrics.total} Issues
            </span>
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Detect stale tickets, track first response latency, and monitor issue resolution velocity.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-card border border-border shadow-xs">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
            <span>Open Issues</span>
            <AlertCircle className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-foreground">{metrics.open}</div>
          <span className="text-[11px] text-muted-foreground font-medium">Requiring resolution</span>
        </div>

        <div className="p-4 rounded-xl bg-card border border-border shadow-xs">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
            <span>Stale Issues (&gt;14d)</span>
            <AlertTriangle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-bold text-rose-500">{metrics.stale}</div>
          <span className="text-[11px] text-rose-400 font-medium">Needs urgent triage</span>
        </div>

        <div className="p-4 rounded-xl bg-card border border-border shadow-xs">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
            <span>Avg First Response</span>
            <Clock className="w-4 h-4 text-primary" />
          </div>
          <div className="text-2xl font-bold text-foreground">{metrics.avgResponseTime}h</div>
          <span className="text-[11px] text-emerald-500 font-medium">Fast community triage</span>
        </div>

        <div className="p-4 rounded-xl bg-card border border-border shadow-xs">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
            <span>Resolved Issues</span>
            <CheckCircle2 className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-2xl font-bold text-foreground">{metrics.closed}</div>
          <span className="text-[11px] text-muted-foreground font-medium">Successfully closed</span>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="p-4 rounded-xl bg-card border border-border/80 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search issues by title, #, or author..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm rounded-lg bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all text-foreground placeholder:text-muted-foreground"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center p-0.5 rounded-lg bg-secondary border border-border text-xs">
            {[
              { id: 'all', label: 'All' },
              { id: 'open', label: 'Open' },
              { id: 'stale', label: 'Stale' },
              { id: 'closed', label: 'Closed' },
            ].map((s) => (
              <button
                key={s.id}
                onClick={() => setSelectedState(s.id)}
                className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                  selectedState === s.id
                    ? 'bg-background text-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>

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

      {/* Issues List */}
      <div className="divide-y divide-border/60 rounded-2xl bg-card border border-border shadow-xs overflow-hidden">
        {filteredIssues.length === 0 ? (
          <div className="p-12 text-center text-sm text-muted-foreground">
            No issues match the selected criteria.
          </div>
        ) : (
          filteredIssues.map((issue) => (
            <div
              key={issue.id}
              className="p-4 hover:bg-muted/30 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-3.5 min-w-0">
                <div
                  className={`mt-1 p-1.5 rounded-lg shrink-0 ${
                    issue.state === 'open'
                      ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                      : 'bg-purple-500/10 text-purple-500 border border-purple-500/20'
                  }`}
                >
                  <AlertCircle className="w-4 h-4" />
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <a
                      href={issue.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm font-semibold text-foreground hover:text-primary transition-colors"
                    >
                      {issue.title}
                    </a>
                    <span className="text-xs text-muted-foreground font-mono">#{issue.number}</span>
                    {issue.isStale && (
                      <span className="px-2 py-0.2 rounded text-[10px] font-semibold bg-rose-500/10 text-rose-500 border border-rose-500/20">
                        Stale (&gt;14d)
                      </span>
                    )}
                    {issue.labels?.map((label) => (
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
                        src={issue.author.avatarUrl}
                        alt={issue.author.name}
                        className="w-4 h-4 rounded-full border border-border"
                      />
                      <span className="font-medium text-foreground">{issue.author.name}</span>
                    </div>
                    <span>•</span>
                    <span>created {formatRelativeTime(issue.createdAt)}</span>
                    {issue.firstResponseHours && (
                      <>
                        <span>•</span>
                        <span className="text-cyan-500 font-medium">
                          First response in {issue.firstResponseHours.toFixed(1)}h
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0 self-end md:self-center">
                <span className="px-2.5 py-0.5 rounded text-xs font-semibold bg-secondary text-secondary-foreground uppercase">
                  {issue.state}
                </span>
                <a
                  href={issue.url}
                  target="_blank"
                  rel="noreferrer"
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                >
                  <ArrowUpRight className="w-4 h-4" />
                </a>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
