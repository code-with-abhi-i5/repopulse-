import { useLocation, useNavigate } from 'react-router-dom'
import { useUIStore, useNotificationStore, useRealtimeStore, useDemoStore, useAuthStore } from '../../stores'
import {
  Search,
  Bell,
  Menu,
  ChevronRight,
  Radio,
  Sparkles,
  LogOut,
  ShieldCheck,
} from 'lucide-react'

function getBreadcrumbs(pathname) {
  const segments = pathname.split('/').filter(Boolean)
  if (segments.length === 0) return [{ label: 'Dashboard' }]

  const labels = {
    dashboard: 'Dashboard Overview',
    repositories: 'Fleet Repositories',
    activity: 'Live Telemetry',
    contributors: 'Contributors Leaderboard',
    'pull-requests': 'Pull Requests',
    issues: 'Issues Triage',
    analytics: 'Analytics & Churn',
    alerts: 'Alert Rules',
    reports: 'Executive Reports',
    settings: 'Settings & Integrations',
  }

  return segments.map((seg) => ({
    label: labels[seg] || decodeURIComponent(seg),
  }))
}

export default function Header() {
  const { setSidebarMobileOpen, setCommandPaletteOpen, setNotificationDrawerOpen } = useUIStore()
  const { unreadCount } = useNotificationStore()
  const { connectionStatus } = useRealtimeStore()
  const { user, logout } = useAuthStore()
  const location = useLocation()
  const navigate = useNavigate()
  const breadcrumbs = getBreadcrumbs(location.pathname)

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-white/[0.08] bg-[#050914]/80 px-4 sm:px-6 backdrop-blur-xl">
      {/* Left: Mobile Toggle & Breadcrumbs */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setSidebarMobileOpen(true)}
          className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
          <span className="hidden sm:inline font-mono text-slate-500">RepoPulse</span>
          <ChevronRight className="hidden sm:inline w-3.5 h-3.5 text-slate-600" />
          {breadcrumbs.map((crumb, idx) => (
            <div key={idx} className="flex items-center gap-2">
              {idx > 0 && <ChevronRight className="w-3.5 h-3.5 text-slate-600" />}
              <span className={idx === breadcrumbs.length - 1 ? 'font-semibold text-slate-100' : 'text-slate-400'}>
                {crumb.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Right: Search, Live Status, Notification, Avatar */}
      <div className="flex items-center gap-3">
        {/* Command palette search bar trigger */}
        <button
          onClick={() => setCommandPaletteOpen(true)}
          className="hidden md:flex items-center gap-3 px-3.5 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800/80 border border-white/10 hover:border-white/20 text-xs text-slate-400 transition-all shadow-inner"
        >
          <Search className="w-3.5 h-3.5 text-slate-400" />
          <span>Quick search or command...</span>
          <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-[10px] font-mono text-slate-300 border border-white/10">
            ⌘K
          </kbd>
        </button>

        {/* Live stream badge */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-live" />
          <span className="font-mono text-[11px]">TELEMETRY LIVE</span>
        </div>

        {/* Notification Bell */}
        <button
          onClick={() => setNotificationDrawerOpen(true)}
          className="relative p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors"
          title="Notifications"
        >
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-indigo-500 text-[10px] font-bold text-white shadow-xs">
              {unreadCount}
            </span>
          )}
        </button>

        {/* User profile avatar & Logout */}
        <div className="flex items-center gap-2 pl-2 border-l border-white/[0.08]">
          <div className="hidden md:flex flex-col text-right">
            <span className="text-xs font-bold text-slate-200">{user?.name || user?.username || 'Admin'}</span>
            <span className="text-[10px] font-mono text-indigo-400">ADMINISTRATOR</span>
          </div>
          <img
            src="https://api.dicebear.com/9.x/avataaars/svg?seed=abhi"
            alt="User profile"
            className="w-8 h-8 rounded-full border border-indigo-500/30 bg-indigo-500/10"
          />
          <button
            type="button"
            onClick={handleLogout}
            title="Log out of Admin Console"
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all ml-1"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  )
}
