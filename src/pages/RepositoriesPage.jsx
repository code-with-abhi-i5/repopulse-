import { useState, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { mockRepositories, mockHealthScores } from '../data/mock'
import { formatNumber, formatRelativeTime } from '../lib/utils'
import {
  FolderGit2,
  Search,
  Plus,
  Star,
  GitFork,
  Eye,
  AlertCircle,
  ExternalLink,
  SlidersHorizontal,
  LayoutGrid,
  List,
  Check,
  ArrowUpDown,
  Sparkles,
  GitCompare,
  X,
  ShieldCheck,
  TrendingUp,
  ChevronRight,
} from 'lucide-react'

const languageColors = {
  TypeScript: '#3178c6',
  JavaScript: '#f7df1e',
  Python: '#3776ab',
  Go: '#00add8',
  Rust: '#dea584',
  HTML: '#e34f26',
}

export default function RepositoriesPage() {
  const navigate = useNavigate()
  const [repositories, setRepositories] = useState(mockRepositories)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedLanguage, setSelectedLanguage] = useState('all')
  const [sortBy, setSortBy] = useState('health')
  const [viewMode, setViewMode] = useState('grid') // 'grid' | 'table'
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [newRepoUrl, setNewRepoUrl] = useState('')
  const [isImporting, setIsImporting] = useState(false)
  const [compareList, setCompareList] = useState([])
  const [isCompareOpen, setIsCompareOpen] = useState(false)

  // Language options
  const languages = useMemo(() => {
    const langs = new Set(repositories.map((r) => r.language).filter(Boolean))
    return ['all', ...Array.from(langs)]
  }, [repositories])

  // Filter & sort logic
  const filteredRepos = useMemo(() => {
    return repositories
      .filter((repo) => {
        const matchesSearch =
          repo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          repo.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          repo.topics?.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()))

        const matchesLang =
          selectedLanguage === 'all' || repo.language?.toLowerCase() === selectedLanguage.toLowerCase()

        return matchesSearch && matchesLang
      })
      .sort((a, b) => {
        if (sortBy === 'health') return (b.healthScore || 0) - (a.healthScore || 0)
        if (sortBy === 'stars') return b.stars - a.stars
        if (sortBy === 'forks') return b.forks - a.forks
        if (sortBy === 'updated') return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        if (sortBy === 'name') return a.name.localeCompare(b.name)
        return 0
      })
  }, [repositories, searchQuery, selectedLanguage, sortBy])

  // Handle mock repo import
  const handleImportRepo = (e) => {
    e.preventDefault()
    if (!newRepoUrl) return

    setIsImporting(true)
    setTimeout(() => {
      const parts = newRepoUrl.replace('https://github.com/', '').split('/')
      const owner = parts[0] || 'organization'
      const name = parts[1] || 'new-repository'
      const newRepo = {
        id: `repo-${Date.now()}`,
        githubId: Math.floor(Math.random() * 1000000),
        name,
        fullName: `${owner}/${name}`,
        owner,
        description: 'Newly connected repository synced with RepoPulse intelligence engine.',
        visibility: 'public',
        defaultBranch: 'main',
        license: 'MIT',
        language: 'TypeScript',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        pushedAt: new Date().toISOString(),
        stars: Math.floor(Math.random() * 50) + 1,
        forks: Math.floor(Math.random() * 10) + 1,
        watchers: Math.floor(Math.random() * 15) + 1,
        openIssues: Math.floor(Math.random() * 5),
        sizeKb: 4200,
        archived: false,
        topics: ['monitored', 'sync-active'],
        healthScore: 88,
      }

      setRepositories([newRepo, ...repositories])
      setIsImporting(false)
      setIsAddModalOpen(false)
      setNewRepoUrl('')
    }, 1200)
  }

  // Toggle repository comparison
  const toggleCompare = (repoId) => {
    setCompareList((prev) => {
      if (prev.includes(repoId)) {
        return prev.filter((id) => id !== repoId)
      }
      if (prev.length >= 2) {
        return [prev[1], repoId]
      }
      return [...prev, repoId]
    })
  }

  const comparedRepos = repositories.filter((r) => compareList.includes(r.id))

  return (
    <div className="space-y-6">
      {/* Top Banner / Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <FolderGit2 className="w-7 h-7 text-indigo-400" />
            Monitored Repositories
            <span className="text-xs px-2.5 py-0.5 rounded-full font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              {filteredRepos.length} Active
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real-time GitHub health scores, pull request latency, and code velocity tracking across your fleet.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {compareList.length > 0 && (
            <button
              onClick={() => setIsCompareOpen(true)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-slate-200 border border-white/10 shadow-xs transition-colors"
            >
              <GitCompare className="w-4 h-4 text-indigo-400" />
              Compare ({compareList.length}/2)
            </button>
          )}

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-md shadow-indigo-500/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            Connect Repository
          </button>
        </div>
      </div>

      {/* Control Bar: Search, Filters, View Modes */}
      <div className="p-4 rounded-2xl glass-card flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by repo name, topic, or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm rounded-xl bg-slate-950/60 border border-white/10 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all text-white placeholder:text-slate-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs"
            >
              Clear
            </button>
          )}
        </div>

        {/* Filters & View Switches */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Language filter */}
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-white/10 text-white text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              {languages.map((lang) => (
                <option key={lang} value={lang}>
                  {lang === 'all' ? 'All Languages' : lang}
                </option>
              ))}
            </select>
          </div>

          {/* Sort selector */}
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <ArrowUpDown className="w-3.5 h-3.5" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-white/10 text-white text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="health">Health Score</option>
              <option value="stars">Most Stars</option>
              <option value="forks">Most Forks</option>
              <option value="updated">Recently Updated</option>
              <option value="name">Repository Name</option>
            </select>
          </div>

          {/* View toggle */}
          <div className="flex items-center p-0.5 rounded-lg bg-slate-900 border border-white/10">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === 'grid' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === 'table' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
              title="Table View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Repository Cards (Grid Mode) */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredRepos.map((repo) => {
            const isCompared = compareList.includes(repo.id)
            const healthScore = repo.healthScore || 80
            const healthColor =
              healthScore >= 90
                ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10'
                : healthScore >= 75
                ? 'text-cyan-400 border-cyan-500/30 bg-cyan-500/10'
                : 'text-amber-400 border-amber-500/30 bg-amber-500/10'

            return (
              <div
                key={repo.id}
                className="group relative flex flex-col justify-between p-6 rounded-2xl glass-card transition-all duration-300 hover:-translate-y-1"
              >
                <div>
                  {/* Card Header: Owner/Name + Health Badge */}
                  <div className="flex items-start justify-between gap-3 mb-2.5">
                    <div className="min-w-0">
                      <span className="text-xs text-slate-500 font-mono block truncate">
                        {repo.owner}
                      </span>
                      <Link
                        to={`/repositories/${repo.owner}/${repo.name}`}
                        className="text-base font-bold text-white group-hover:text-indigo-400 transition-colors truncate block"
                      >
                        {repo.name}
                      </Link>
                    </div>

                    {/* Health score badge */}
                    <div
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold font-mono border ${healthColor}`}
                      title={`Pulse Score: ${healthScore}/100`}
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>{healthScore}</span>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-slate-400 line-clamp-2 mb-4 leading-relaxed">
                    {repo.description || 'No description provided for this repository.'}
                  </p>

                  {/* Topics Tags */}
                  <div className="flex flex-wrap gap-1.5 mb-5">
                    {repo.topics?.slice(0, 3).map((topic) => (
                      <span
                        key={topic}
                        className="px-2 py-0.5 text-[11px] font-medium rounded-md bg-white/[0.04] text-slate-300 border border-white/[0.08]"
                      >
                        #{topic}
                      </span>
                    ))}
                    {repo.topics && repo.topics.length > 3 && (
                      <span className="text-[10px] text-slate-500 self-center">
                        +{repo.topics.length - 3}
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  {/* Key Stats Bar */}
                  <div className="grid grid-cols-4 py-3 border-y border-white/[0.08] text-center gap-1 mb-4">
                    <div>
                      <div className="flex items-center justify-center gap-1 text-slate-400 text-xs mb-0.5">
                        <Star className="w-3 h-3 text-amber-400" />
                      </div>
                      <span className="text-xs font-bold text-white font-mono">
                        {formatNumber(repo.stars)}
                      </span>
                    </div>
                    <div>
                      <div className="flex items-center justify-center gap-1 text-slate-400 text-xs mb-0.5">
                        <GitFork className="w-3 h-3 text-indigo-400" />
                      </div>
                      <span className="text-xs font-bold text-white font-mono">
                        {formatNumber(repo.forks)}
                      </span>
                    </div>
                    <div>
                      <div className="flex items-center justify-center gap-1 text-slate-400 text-xs mb-0.5">
                        <Eye className="w-3 h-3 text-purple-400" />
                      </div>
                      <span className="text-xs font-bold text-white font-mono">
                        {formatNumber(repo.watchers)}
                      </span>
                    </div>
                    <div>
                      <div className="flex items-center justify-center gap-1 text-slate-400 text-xs mb-0.5">
                        <AlertCircle className="w-3 h-3 text-emerald-400" />
                      </div>
                      <span className="text-xs font-bold text-white font-mono">
                        {repo.openIssues}
                      </span>
                    </div>
                  </div>

                  {/* Bottom Footer: Language + Updated Time + Action */}
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <div className="flex items-center gap-2">
                      {repo.language && (
                        <div className="flex items-center gap-1.5">
                          <span
                            className="w-2.5 h-2.5 rounded-full"
                            style={{
                              backgroundColor: languageColors[repo.language] || '#888',
                            }}
                          />
                          <span className="font-medium text-slate-200">{repo.language}</span>
                        </div>
                      )}
                      <span>•</span>
                      <span>{formatRelativeTime(repo.updatedAt)}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => toggleCompare(repo.id)}
                        className={`p-1.5 rounded-lg transition-colors ${
                          isCompared
                            ? 'bg-indigo-500/20 text-indigo-400'
                            : 'hover:bg-white/[0.06] text-slate-400 hover:text-white'
                        }`}
                        title={isCompared ? 'Remove from comparison' : 'Compare repository'}
                      >
                        <GitCompare className="w-3.5 h-3.5" />
                      </button>

                      <Link
                        to={`/repositories/${repo.owner}/${repo.name}`}
                        className="px-3 py-1 rounded-lg bg-slate-900 hover:bg-indigo-600 hover:text-white text-slate-200 font-semibold text-xs transition-colors flex items-center gap-1 border border-white/10"
                      >
                        Details
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        /* Table Mode */
        <div className="overflow-x-auto rounded-2xl border border-white/[0.08] glass-card">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-white/[0.08] bg-slate-950/40 text-slate-400 text-xs uppercase tracking-wider font-semibold">
                <th className="py-3.5 px-4">Repository</th>
                <th className="py-3.5 px-4">Pulse Health</th>
                <th className="py-3.5 px-4">Language</th>
                <th className="py-3.5 px-4">Stars</th>
                <th className="py-3.5 px-4">Forks</th>
                <th className="py-3.5 px-4">Issues</th>
                <th className="py-3.5 px-4">Updated</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06]">
              {filteredRepos.map((repo) => {
                const health = repo.healthScore || 80
                const isCompared = compareList.includes(repo.id)
                return (
                  <tr key={repo.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 px-4">
                      <Link
                        to={`/repositories/${repo.owner}/${repo.name}`}
                        className="font-bold text-white hover:text-indigo-400 transition-colors block"
                      >
                        {repo.fullName}
                      </Link>
                      <span className="text-xs text-slate-400 truncate block max-w-xs">
                        {repo.description}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold font-mono ${
                          health >= 90
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : health >= 75
                            ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}
                      >
                        {health}/100
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5 text-xs text-slate-300">
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{
                            backgroundColor: languageColors[repo.language] || '#888',
                          }}
                        />
                        {repo.language}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-xs font-mono font-medium text-slate-200">{formatNumber(repo.stars)}</td>
                    <td className="py-3 px-4 text-xs font-mono font-medium text-slate-200">{formatNumber(repo.forks)}</td>
                    <td className="py-3 px-4 text-xs font-mono font-medium text-slate-200">{repo.openIssues}</td>
                    <td className="py-3 px-4 text-xs text-slate-500">{formatRelativeTime(repo.updatedAt)}</td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => toggleCompare(repo.id)}
                          className={`p-1.5 rounded-lg text-xs font-medium ${
                            isCompared ? 'bg-indigo-500/20 text-indigo-400' : 'hover:bg-white/[0.06] text-slate-400'
                          }`}
                        >
                          <GitCompare className="w-4 h-4" />
                        </button>
                        <Link
                          to={`/repositories/${repo.owner}/${repo.name}`}
                          className="px-3 py-1 rounded-lg bg-slate-900 hover:bg-indigo-600 hover:text-white text-xs font-semibold text-slate-200 transition-colors border border-white/10"
                        >
                          View
                        </Link>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Comparison Drawer / Modal */}
      {isCompareOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-4xl p-6 sm:p-8 rounded-2xl glass-card border border-white/15 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
              <div className="flex items-center gap-2">
                <GitCompare className="w-5 h-5 text-indigo-400" />
                <h3 className="text-lg font-bold text-white">Repository Benchmark Comparison</h3>
              </div>
              <button
                onClick={() => setIsCompareOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {comparedRepos.length < 2 ? (
              <div className="text-center py-10 space-y-3">
                <p className="text-slate-400 text-sm">
                  Please select at least 2 repositories to perform benchmark side-by-side comparison.
                </p>
                <button
                  onClick={() => setIsCompareOpen(false)}
                  className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold"
                >
                  Select Repositories
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-6">
                {comparedRepos.map((repo) => (
                  <div key={repo.id} className="p-5 rounded-2xl bg-slate-900/60 border border-white/[0.08] space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-white text-base">{repo.fullName}</h4>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold font-mono bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                        Score {repo.healthScore}
                      </span>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between py-1.5 border-b border-white/[0.06]">
                        <span className="text-slate-400">Primary Language</span>
                        <span className="font-semibold text-slate-200">{repo.language}</span>
                      </div>
                      <div className="flex justify-between py-1.5 border-b border-white/[0.06]">
                        <span className="text-slate-400">Stars</span>
                        <span className="font-bold font-mono text-white">{formatNumber(repo.stars)}</span>
                      </div>
                      <div className="flex justify-between py-1.5 border-b border-white/[0.06]">
                        <span className="text-slate-400">Forks</span>
                        <span className="font-bold font-mono text-white">{formatNumber(repo.forks)}</span>
                      </div>
                      <div className="flex justify-between py-1.5 border-b border-white/[0.06]">
                        <span className="text-slate-400">Open Issues</span>
                        <span className="font-bold font-mono text-white">{repo.openIssues}</span>
                      </div>
                      <div className="flex justify-between py-1.5">
                        <span className="text-slate-400">License</span>
                        <span className="font-medium text-slate-300">{repo.license}</span>
                      </div>
                    </div>

                    <Link
                      to={`/repositories/${repo.owner}/${repo.name}`}
                      className="block text-center w-full py-2.5 rounded-xl bg-indigo-600 text-white font-semibold text-xs hover:bg-indigo-500 transition-colors shadow-sm"
                    >
                      Open Deep Intelligence
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Connect Repo Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-md p-6 rounded-2xl glass-card border border-white/15 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <div className="flex items-center gap-2">
                <FolderGit2 className="w-5 h-5 text-indigo-400" />
                <h3 className="text-base font-bold text-white">Connect GitHub Repository</h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleImportRepo} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-200 block mb-1.5">
                  GitHub Repository URL or "owner/repo"
                </label>
                <input
                  type="text"
                  required
                  placeholder="https://github.com/facebook/react or vercel/next.js"
                  value={newRepoUrl}
                  onChange={(e) => setNewRepoUrl(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-xl bg-slate-950/60 border border-white/10 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 text-white placeholder:text-slate-500"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  RepoPulse will immediately backfill commit activity, calculate health metrics, and stream webhook events.
                </span>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-white/[0.08]">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-slate-400 hover:text-white hover:bg-white/[0.06]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isImporting}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-indigo-600 to-violet-600 text-white hover:from-indigo-500 hover:to-violet-500 shadow-md shadow-indigo-500/25 disabled:opacity-50"
                >
                  {isImporting ? (
                    <>
                      <Sparkles className="w-3.5 h-3.5 animate-spin" />
                      Analyzing Repo...
                    </>
                  ) : (
                    <>
                      <Plus className="w-3.5 h-3.5" />
                      Start Syncing
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
