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
} from 'lucide-react'

export default function ContributorsPage() {
  const [contributors] = useState(mockContributors)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('commits')
  const [selectedContributor, setSelectedContributor] = useState(null)

  // Filter & sort
  const filteredContributors = useMemo(() => {
    return contributors
      .filter((c) => {
        return (
          c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.login.toLowerCase().includes(searchQuery.toLowerCase())
        )
      })
      .sort((a, b) => {
        if (sortBy === 'commits') return b.commits - a.commits
        if (sortBy === 'streak') return b.currentStreak - a.currentStreak
        if (sortBy === 'additions') return b.additions - a.additions
        if (sortBy === 'activeDays') return b.activeDays - a.activeDays
        return 0
      })
  }, [contributors, searchQuery, sortBy])

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
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <Users className="w-7 h-7 text-indigo-400" />
            Contributors & Engineering Leaderboard
            <span className="text-xs px-2.5 py-0.5 rounded-full font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              {contributors.length} Active Developers
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Tracking commit volume, code churn, streaks, and bus-factor distribution across the fleet.
          </p>
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

              <div className="flex items-center gap-3.5 mb-4">
                <img
                  src={c.avatarUrl}
                  alt={c.name}
                  className="w-13 h-13 rounded-full border-2 border-white/20 group-hover:scale-105 transition-transform"
                />
                <div>
                  <h3 className="font-bold text-white text-base group-hover:text-indigo-400 transition-colors">
                    {c.name}
                  </h3>
                  <span className="text-xs text-slate-400 font-mono">@{c.login}</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 py-3 border-t border-white/[0.08] text-center text-xs">
                <div>
                  <span className="text-slate-400 text-[11px] block">Commits</span>
                  <span className="text-base font-bold text-white font-mono mt-0.5 block">{c.commits}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[11px] block">Additions</span>
                  <span className="text-base font-bold text-emerald-400 font-mono mt-0.5 block">+{formatNumber(c.additions)}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[11px] block">Active Days</span>
                  <span className="text-base font-bold text-white font-mono mt-0.5 block">{c.activeDays}</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Control Bar */}
      <div className="p-4 rounded-2xl glass-card flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search contributor by name or login..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm rounded-xl bg-slate-950/60 border border-white/10 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all text-white placeholder:text-slate-500"
          />
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400">
          <ArrowUpDown className="w-3.5 h-3.5" />
          <span>Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-slate-900 border border-white/10 text-white text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="commits">Total Commits</option>
            <option value="streak">Active Streak</option>
            <option value="additions">Code Added</option>
            <option value="activeDays">Active Days</option>
          </select>
        </div>
      </div>

      {/* Contributor Directory Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredContributors.map((c, idx) => (
          <div
            key={c.id}
            onClick={() => setSelectedContributor(c)}
            className="p-5 rounded-2xl glass-card transition-all duration-300 cursor-pointer flex flex-col justify-between hover:-translate-y-1"
          >
            <div>
              <div className="flex items-start justify-between gap-3 mb-3">
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
                    <span className="text-xs text-slate-400 font-mono">@{c.login}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-xs text-amber-400 font-semibold bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                  <Flame className="w-3.5 h-3.5 fill-amber-400" />
                  <span>{c.currentStreak}d</span>
                </div>
              </div>

              {/* Stats Bar */}
              <div className="grid grid-cols-3 gap-2 py-2.5 border-y border-white/[0.08] text-center text-xs my-3">
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
              <span>Longest streak: {c.longestStreak}d</span>
            </div>
          </div>
        ))}
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
                  <h3 className="text-lg font-bold text-white">{selectedContributor.name}</h3>
                  <span className="text-xs text-slate-400 font-mono">@{selectedContributor.login}</span>
                  <div className="flex items-center gap-2 mt-1">
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
                <span className="text-slate-400 text-xs block">Commits</span>
                <span className="text-lg font-bold text-white font-mono mt-0.5 block">{selectedContributor.commits}</span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-900/60 border border-white/[0.08]">
                <span className="text-slate-400 text-xs block">Additions</span>
                <span className="text-lg font-bold text-emerald-400 font-mono mt-0.5 block">+{formatNumber(selectedContributor.additions)}</span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-900/60 border border-white/[0.08]">
                <span className="text-slate-400 text-xs block">Deletions</span>
                <span className="text-lg font-bold text-rose-400 font-mono mt-0.5 block">-{formatNumber(selectedContributor.deletions)}</span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-900/60 border border-white/[0.08]">
                <span className="text-slate-400 text-xs block">Active Days</span>
                <span className="text-lg font-bold text-white font-mono mt-0.5 block">{selectedContributor.activeDays}</span>
              </div>
            </div>

            {/* Recent Commits */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Code2 className="w-4 h-4 text-indigo-400" />
                Recent Commits by {selectedContributor.name}
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
                          {formatRelativeTime(c.timestamp)} • <span className="font-mono text-indigo-400">{c.sha}</span>
                        </span>
                      </div>
                      <div className="font-mono shrink-0 text-xs">
                        <span className="text-emerald-400 font-semibold">+{c.additions}</span>{' '}
                        <span className="text-rose-400 font-semibold">-{c.deletions}</span>
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
