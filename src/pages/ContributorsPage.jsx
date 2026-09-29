import { useState, useMemo } from 'react'
import { mockContributors, mockCommits } from '../data/mock'
import { formatNumber, formatDate, formatRelativeTime } from '../lib/utils'
import {
  Users,
  Search,
  Flame,
  GitCommit,
  Trophy,
  Medal,
  Calendar,
  Sparkles,
  ArrowUpDown,
  ExternalLink,
  X,
  Code2,
  FolderGit2,
  Layers,
  UploadCloud,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react'

export default function ContributorsPage() {
  const [contributors] = useState(mockContributors)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTeam, setSelectedTeam] = useState('all')
  const [sortBy, setSortBy] = useState('commits')
  const [selectedContributor, setSelectedContributor] = useState(null)

  // Unique teams list
  const uniqueTeams = useMemo(() => {
    const teams = new Set()
    contributors.forEach((c) => c.teamName && teams.add(c.teamName))
    return ['all', ...Array.from(teams)]
  }, [contributors])

  // Total summary telemetry
  const summaryTelemetry = useMemo(() => {
    const totalPushes = contributors.reduce(
      (acc, c) => acc + (c.pushesCount || Math.floor(c.commits * 0.35)),
      0
    )
    const totalAdditions = contributors.reduce((acc, c) => acc + c.additions, 0)
    const totalDeletions = contributors.reduce((acc, c) => acc + c.deletions, 0)
    return { totalPushes, totalAdditions, totalDeletions }
  }, [contributors])

  // Filter & sort
  const filteredContributors = useMemo(() => {
    return contributors
      .filter((c) => {
        const matchesSearch =
          c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.login.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (c.teamName && c.teamName.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (c.primaryRepo && c.primaryRepo.toLowerCase().includes(searchQuery.toLowerCase()))

        const matchesTeam = selectedTeam === 'all' || c.teamName === selectedTeam

        return matchesSearch && matchesTeam
      })
      .sort((a, b) => {
        if (sortBy === 'commits') return b.commits - a.commits
        if (sortBy === 'pushes')
          return (
            (b.pushesCount || Math.floor(b.commits * 0.35)) -
            (a.pushesCount || Math.floor(a.commits * 0.35))
          )
        if (sortBy === 'streak') return b.currentStreak - a.currentStreak
        if (sortBy === 'additions') return b.additions - a.additions
        if (sortBy === 'activeDays') return b.activeDays - a.activeDays
        return 0
      })
  }, [contributors, searchQuery, selectedTeam, sortBy])

  // Contributor's commits for modal
  const contributorCommits = useMemo(() => {
    if (!selectedContributor) return []
    return mockCommits
      .filter((c) => c.author.login === selectedContributor.login)
      .slice(0, 10)
  }, [selectedContributor])

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5 flex-wrap">
            <Users className="w-7 h-7 text-indigo-400" />
            Contributors & Engineering Leaderboard
            <span className="text-xs px-2.5 py-0.5 rounded-full font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Personal Push Tracking
            </span>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              {contributors.length} Active Developers
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Tracking individual push frequency, target repositories, lines added vs deleted, and code churn volume.
          </p>
        </div>
      </div>

      {/* Top Telemetry KPI Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl glass-card flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-medium text-slate-400 block uppercase tracking-wider">
              Total Developers
            </span>
            <span className="text-xl font-bold font-mono text-white">
              {contributors.length} Active
            </span>
          </div>
        </div>

        <div className="p-4 rounded-2xl glass-card flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <GitCommit className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-medium text-slate-400 block uppercase tracking-wider">
              Total Pushes Tracked
            </span>
            <span className="text-xl font-bold font-mono text-blue-400">
              {summaryTelemetry.totalPushes} Pushes
            </span>
          </div>
        </div>

        <div className="p-4 rounded-2xl glass-card flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Code2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-medium text-slate-400 block uppercase tracking-wider">
              Total Lines Added
            </span>
            <span className="text-xl font-bold font-mono text-emerald-400">
              +{formatNumber(summaryTelemetry.totalAdditions)}
            </span>
          </div>
        </div>

        <div className="p-4 rounded-2xl glass-card flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-medium text-slate-400 block uppercase tracking-wider">
              Total Lines Deleted
            </span>
            <span className="text-xl font-bold font-mono text-rose-400">
              -{formatNumber(summaryTelemetry.totalDeletions)}
            </span>
          </div>
        </div>
      </div>

      {/* Top 3 Podium Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {contributors.slice(0, 3).map((c, idx) => {
          const podiumStyles = [
            {
              border: 'border-amber-500/40 bg-gradient-to-b from-amber-500/10 via-slate-900/60 to-slate-950/80',
              badge: 'bg-amber-400 text-black',
              medal: 'Gold Contributor',
              rank: '#1',
            },
            {
              border: 'border-slate-400/40 bg-gradient-to-b from-slate-400/10 via-slate-900/60 to-slate-950/80',
              badge: 'bg-slate-200 text-black',
              medal: 'Silver Contributor',
              rank: '#2',
            },
            {
              border: 'border-amber-700/40 bg-gradient-to-b from-amber-700/10 via-slate-900/60 to-slate-950/80',
              badge: 'bg-amber-700 text-white',
              medal: 'Bronze Contributor',
              rank: '#3',
            },
          ][idx]

          const pushes = c.pushesCount || Math.floor(c.commits * 0.35)

          return (
            <div
              key={c.id}
              onClick={() => setSelectedContributor(c)}
              className={`p-6 rounded-2xl border ${podiumStyles.border} glass-card relative overflow-hidden shadow-lg transition-all duration-300 cursor-pointer group hover:-translate-y-1`}
            >
              <div className="flex items-center justify-between mb-4">
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${podiumStyles.badge}`}>
                  {podiumStyles.rank} {podiumStyles.medal}
                </span>
                <div className="flex items-center gap-1 text-xs text-amber-400 font-bold bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
                  <Flame className="w-3.5 h-3.5 fill-amber-400" />
                  <span>{c.currentStreak}d Streak</span>
                </div>
              </div>

              <div className="flex items-center gap-3.5 mb-3">
                <img
                  src={c.avatarUrl}
                  alt={c.name}
                  className="w-14 h-14 rounded-full border-2 border-white/20 group-hover:scale-105 transition-transform"
                />
                <div className="min-w-0">
                  <h3 className="font-bold text-white text-base group-hover:text-indigo-400 transition-colors truncate">
                    {c.name}
                  </h3>
                  <span className="text-xs text-slate-400 font-mono block truncate">@{c.login}</span>

                  {/* Team Badge */}
                  {c.teamName && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 mt-1">
                      <Users className="w-2.5 h-2.5" />
                      {c.teamName}
                    </span>
                  )}
                </div>
              </div>

              {/* Primary Target Repo */}
              {c.primaryRepo && (
                <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono mb-3">
                  <FolderGit2 className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                  <span className="truncate">{c.primaryRepo}</span>
                </div>
              )}

              {/* Granular Code Churn & Push Stats */}
              <div className="grid grid-cols-4 gap-1 py-3 border-t border-white/[0.08] text-center text-xs">
                <div>
                  <span className="text-slate-400 text-[10px] block">Pushes</span>
                  <span className="text-sm font-bold text-blue-400 font-mono mt-0.5 block">{pushes}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block">Commits</span>
                  <span className="text-sm font-bold text-white font-mono mt-0.5 block">{c.commits}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block">Added</span>
                  <span className="text-sm font-bold text-emerald-400 font-mono mt-0.5 block">+{formatNumber(c.additions)}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block">Deleted</span>
                  <span className="text-sm font-bold text-rose-400 font-mono mt-0.5 block">-{formatNumber(c.deletions)}</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Control Bar: Search + Team Filter + Sort */}
      <div className="p-4 rounded-2xl glass-card flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search developer, team, or repository..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm rounded-xl bg-slate-950/60 border border-white/10 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all text-white placeholder:text-slate-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Team Filter */}
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Users className="w-3.5 h-3.5 text-indigo-400" />
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
          </div>

          {/* Sort By */}
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <ArrowUpDown className="w-3.5 h-3.5 text-indigo-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-1.5 rounded-lg bg-slate-900 border border-white/10 text-white text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="commits">Total Commits</option>
              <option value="pushes">Pushes Frequency</option>
              <option value="additions">Code Added (+lines)</option>
              <option value="streak">Active Streak</option>
              <option value="activeDays">Active Days</option>
            </select>
          </div>
        </div>
      </div>

      {/* Contributor Directory Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredContributors.map((c, idx) => {
          const pushes = c.pushesCount || Math.floor(c.commits * 0.35)

          return (
            <div
              key={c.id}
              onClick={() => setSelectedContributor(c)}
              className="p-5 rounded-2xl glass-card transition-all duration-300 cursor-pointer flex flex-col justify-between hover:-translate-y-1"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-2.5">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <img src={c.avatarUrl} alt={c.name} className="w-10 h-10 rounded-full border border-white/10" />
                      <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-slate-900 border border-white/10 text-[10px] font-bold text-slate-300 flex items-center justify-center">
                        {idx + 1}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-sm hover:text-indigo-400 transition-colors">
                        {c.name}
                      </h3>
                      <span className="text-xs text-slate-400 font-mono block">@{c.login}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 text-xs text-amber-400 font-semibold bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                    <Flame className="w-3.5 h-3.5 fill-amber-400" />
                    <span>{c.currentStreak}d</span>
                  </div>
                </div>

                {/* Team & Primary Repo Pill */}
                <div className="flex items-center gap-1.5 flex-wrap my-2">
                  {c.teamName && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/15 text-indigo-300 border border-indigo-500/25">
                      <Users className="w-2.5 h-2.5 text-indigo-400" />
                      {c.teamName}
                    </span>
                  )}
                  {c.primaryRepo && (
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono text-slate-300 bg-white/[0.04] border border-white/[0.08] truncate max-w-[180px]">
                      <FolderGit2 className="w-2.5 h-2.5 text-indigo-400 shrink-0" />
                      {c.primaryRepo}
                    </span>
                  )}
                </div>

                {/* Granular Telemetry Stats: Pushes, Commits, Additions, Deletions */}
                <div className="grid grid-cols-4 gap-1 py-2.5 border-y border-white/[0.08] text-center text-xs my-2.5">
                  <div>
                    <div className="text-slate-400 text-[10px]">Pushes</div>
                    <div className="font-bold text-blue-400 font-mono mt-0.5">{pushes}</div>
                  </div>
                  <div>
                    <div className="text-slate-400 text-[10px]">Commits</div>
                    <div className="font-bold text-white font-mono mt-0.5">{c.commits}</div>
                  </div>
                  <div>
                    <div className="text-slate-400 text-[10px]">Additions</div>
                    <div className="font-bold text-emerald-400 font-mono mt-0.5">+{formatNumber(c.additions)}</div>
                  </div>
                  <div>
                    <div className="text-slate-400 text-[10px]">Deletions</div>
                    <div className="font-bold text-rose-400 font-mono mt-0.5">-{formatNumber(c.deletions)}</div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                <span>Active {c.activeDays} days</span>
                <span className="text-slate-400 font-mono">Net: +{formatNumber(c.additions - c.deletions)} diff</span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Deep-Dive Contributor Modal */}
      {selectedContributor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl p-6 sm:p-8 rounded-2xl glass-card border border-white/15 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-white/[0.08] pb-4">
              <div className="flex items-center gap-4">
                <img
                  src={selectedContributor.avatarUrl}
                  alt={selectedContributor.name}
                  className="w-16 h-16 rounded-full border-2 border-indigo-500/40"
                />
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    {selectedContributor.name}
                    {selectedContributor.teamName && (
                      <span className="px-2 py-0.5 rounded text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                        {selectedContributor.teamName}
                      </span>
                    )}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-slate-400 font-mono mt-1">
                    <span>@{selectedContributor.login}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <FolderGit2 className="w-3.5 h-3.5 text-indigo-400" />
                      {selectedContributor.primaryRepo || 'Assigned Hackathon Repo'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="flex items-center gap-1 text-xs text-amber-400 font-bold bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
                      <Flame className="w-3.5 h-3.5 fill-amber-400" />
                      {selectedContributor.currentStreak} day streak
                    </span>
                    <span className="text-xs text-slate-400">
                      Best: {selectedContributor.longestStreak} days
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setSelectedContributor(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-4 gap-3 text-center">
              <div className="p-3.5 rounded-xl bg-slate-900/60 border border-white/[0.08]">
                <span className="text-slate-400 text-xs block">Pushes</span>
                <span className="text-lg font-bold text-blue-400 font-mono mt-0.5 block">
                  {selectedContributor.pushesCount || Math.floor(selectedContributor.commits * 0.35)}
                </span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-900/60 border border-white/[0.08]">
                <span className="text-slate-400 text-xs block">Commits</span>
                <span className="text-lg font-bold text-white font-mono mt-0.5 block">
                  {selectedContributor.commits}
                </span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-900/60 border border-white/[0.08]">
                <span className="text-slate-400 text-xs block">Lines Added</span>
                <span className="text-lg font-bold text-emerald-400 font-mono mt-0.5 block">
                  +{formatNumber(selectedContributor.additions)}
                </span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-900/60 border border-white/[0.08]">
                <span className="text-slate-400 text-xs block">Lines Deleted</span>
                <span className="text-lg font-bold text-rose-400 font-mono mt-0.5 block">
                  -{formatNumber(selectedContributor.deletions)}
                </span>
              </div>
            </div>

            {/* Recent Commits with lines added / lines deleted */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Code2 className="w-4 h-4 text-indigo-400" />
                Recent Verified Commits by {selectedContributor.name}
              </h4>

              <div className="divide-y divide-white/[0.06] border border-white/[0.08] rounded-xl bg-slate-950/60 p-2">
                {contributorCommits.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-500">
                    No recent commits found in current window.
                  </div>
                ) : (
                  contributorCommits.map((c) => (
                    <div key={c.id} className="py-2.5 px-3 flex items-center justify-between text-xs">
                      <div className="min-w-0 pr-4">
                        <p className="font-semibold text-slate-200 truncate">{c.message}</p>
                        <span className="text-slate-500 text-[11px]">
                          {formatRelativeTime(c.timestamp)} • <span className="font-mono text-indigo-400">#{c.sha}</span>
                        </span>
                      </div>
                      <div className="font-mono shrink-0 text-xs flex items-center gap-1.5">
                        <span className="px-2 py-0.5 rounded font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          +{c.additions}
                        </span>
                        <span className="px-2 py-0.5 rounded font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                          -{c.deletions}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
