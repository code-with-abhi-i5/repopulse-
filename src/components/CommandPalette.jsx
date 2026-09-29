import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUIStore } from '../stores'
import {
  LayoutDashboard,
  FolderGit2,
  Activity,
  Users,
  GitPullRequest,
  CircleDot,
  BarChart3,
  Bell,
  FileText,
  Settings,
  Search,
  Sun,
  Moon,
  X,
} from 'lucide-react'

const commands = [
  { id: 'dashboard', label: 'Go to Dashboard', icon: LayoutDashboard, path: '/dashboard' },
  { id: 'repositories', label: 'Open Repositories', icon: FolderGit2, path: '/repositories' },
  { id: 'activity', label: 'View Activity', icon: Activity, path: '/activity' },
  { id: 'contributors', label: 'View Contributors', icon: Users, path: '/contributors' },
  { id: 'pull-requests', label: 'View Pull Requests', icon: GitPullRequest, path: '/pull-requests' },
  { id: 'issues', label: 'View Issues', icon: CircleDot, path: '/issues' },
  { id: 'analytics', label: 'Open Analytics', icon: BarChart3, path: '/analytics' },
  { id: 'alerts', label: 'Open Alerts', icon: Bell, path: '/alerts' },
  { id: 'reports', label: 'Generate Report', icon: FileText, path: '/reports' },
  { id: 'settings', label: 'Open Settings', icon: Settings, path: '/settings' },
]

export default function CommandPalette() {
  const { commandPaletteOpen, setCommandPaletteOpen, theme, setTheme } = useUIStore()
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef(null)

  const filtered = commands.filter((cmd) =>
    cmd.label.toLowerCase().includes(query.toLowerCase())
  )

  useEffect(() => {
    function handleKeyDown(e) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setCommandPaletteOpen(!commandPaletteOpen)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [commandPaletteOpen])

  useEffect(() => {
    if (commandPaletteOpen) {
      setQuery('')
      setSelectedIndex(0)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [commandPaletteOpen])

  useEffect(() => {
    setSelectedIndex(0)
  }, [query])

  function handleSelect(cmd) {
    setCommandPaletteOpen(false)
    if (cmd.path) {
      navigate(cmd.path)
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex((i) => Math.min(i + 1, filtered.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex((i) => Math.max(i - 1, 0))
    } else if (e.key === 'Enter' && filtered[selectedIndex]) {
      handleSelect(filtered[selectedIndex])
    } else if (e.key === 'Escape') {
      setCommandPaletteOpen(false)
    }
  }

  if (!commandPaletteOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh]">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={() => setCommandPaletteOpen(false)}
      />

      {/* Dialog */}
      <div className="relative w-full max-w-lg mx-4 rounded-xl border border-border bg-surface shadow-2xl animate-fade-in overflow-hidden">
        {/* Search input */}
        <div className="flex items-center border-b border-border px-4">
          <Search className="h-4 w-4 text-text-muted shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a command or search..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent px-3 py-3.5 text-sm text-text-primary placeholder:text-text-muted outline-none"
          />
          <button
            onClick={() => setCommandPaletteOpen(false)}
            className="rounded p-1 text-text-muted hover:text-text-primary"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Results */}
        <div className="max-h-72 overflow-y-auto p-2">
          {filtered.length > 0 ? (
            <div className="space-y-0.5">
              <p className="px-2 py-1.5 text-xs font-medium text-text-muted uppercase tracking-wider">Navigation</p>
              {filtered.map((cmd, i) => {
                const Icon = cmd.icon
                return (
                  <button
                    key={cmd.id}
                    onClick={() => handleSelect(cmd)}
                    className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                      i === selectedIndex
                        ? 'bg-accent/10 text-accent'
                        : 'text-text-secondary hover:bg-surface-hover hover:text-text-primary'
                    }`}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span>{cmd.label}</span>
                  </button>
                )
              })}

              {/* Theme toggle */}
              <p className="px-2 py-1.5 pt-3 text-xs font-medium text-text-muted uppercase tracking-wider">Actions</p>
              <button
                onClick={() => {
                  setTheme(theme === 'dark' ? 'light' : 'dark')
                  setCommandPaletteOpen(false)
                }}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-text-secondary hover:bg-surface-hover hover:text-text-primary transition-colors"
              >
                {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                <span>Toggle Theme</span>
              </button>
            </div>
          ) : (
            <div className="py-8 text-center text-sm text-text-muted">
              No results found
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center gap-4 border-t border-border px-4 py-2 text-[11px] text-text-muted">
          <span className="flex items-center gap-1">
            <kbd className="rounded bg-surface-elevated px-1 py-0.5 border border-border">↑↓</kbd> Navigate
          </span>
          <span className="flex items-center gap-1">
            <kbd className="rounded bg-surface-elevated px-1 py-0.5 border border-border">↵</kbd> Select
          </span>
          <span className="flex items-center gap-1">
            <kbd className="rounded bg-surface-elevated px-1 py-0.5 border border-border">Esc</kbd> Close
          </span>
        </div>
      </div>
    </div>
  )
}
