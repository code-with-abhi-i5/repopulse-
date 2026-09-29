import { NavLink, useLocation } from 'react-router-dom'
import { useUIStore, useDemoStore } from '../../stores'
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
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  Zap,
  Sparkles,
} from 'lucide-react'

const navItems = [
  { path: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { path: '/repositories', label: 'Repositories', icon: FolderGit2 },
  { path: '/activity', label: 'Live Activity', icon: Activity },
  { path: '/contributors', label: 'Contributors', icon: Users },
  { path: '/pull-requests', label: 'Pull Requests', icon: GitPullRequest },
  { path: '/issues', label: 'Issues Triage', icon: CircleDot },
  { path: '/analytics', label: 'Analytics', icon: BarChart3 },
  { path: '/alerts', label: 'Alert Rules', icon: Bell },
  { path: '/reports', label: 'Reports', icon: FileText },
]

const bottomItems = [
  { path: '/settings', label: 'Settings', icon: Settings },
]

export default function Sidebar() {
  const {
    sidebarCollapsed,
    sidebarMobileOpen,
    toggleSidebar,
    setSidebarMobileOpen,
    theme,
    setTheme,
  } = useUIStore()
  const { isDemoMode } = useDemoStore()
  const location = useLocation()

  const isCollapsed = sidebarCollapsed
  const sidebarWidth = isCollapsed ? 'w-[72px]' : 'w-[250px]'

  return (
    <aside
      className={`
        fixed inset-y-0 left-0 z-50 flex flex-col border-r border-white/[0.08] bg-[#050914] transition-all duration-300
        lg:relative lg:z-auto
        ${sidebarWidth}
        ${sidebarMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}
    >
      {/* Brand Header */}
      <div className="flex h-16 items-center justify-between border-b border-white/[0.08] px-4">
        <NavLink to="/dashboard" className="flex items-center gap-3 overflow-hidden">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-md shadow-indigo-500/25 ring-1 ring-white/20">
            <Zap className="h-5 w-5" />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col">
              <span className="text-sm font-bold tracking-tight text-white">
                Repo<span className="text-indigo-400">Pulse</span>
              </span>
              <span className="text-[10px] text-slate-500 font-mono">MISSION CONTROL</span>
            </div>
          )}
        </NavLink>

        {!isCollapsed && (
          <button
            onClick={toggleSidebar}
            className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors"
            title="Collapse Sidebar"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Navigation links */}
      <nav className="flex-1 space-y-1.5 overflow-y-auto p-3">
        <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono">
          {!isCollapsed ? 'Intelligence Cockpit' : '•••'}
        </div>

        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = location.pathname === item.path

          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setSidebarMobileOpen(false)}
              className={`
                group flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-semibold transition-all duration-200
                ${
                  isActive
                    ? 'bg-indigo-600/15 text-indigo-300 border border-indigo-500/30 shadow-xs'
                    : 'text-slate-400 hover:bg-white/[0.04] hover:text-slate-200'
                }
              `}
              title={isCollapsed ? item.label : undefined}
            >
              <Icon
                className={`h-4 w-4 shrink-0 transition-transform group-hover:scale-110 ${
                  isActive ? 'text-indigo-400' : 'text-slate-400 group-hover:text-slate-200'
                }`}
              />
              {!isCollapsed && <span className="truncate">{item.label}</span>}
              {isActive && !isCollapsed && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-400 shadow-sm shadow-indigo-400/50" />
              )}
            </NavLink>
          )
        })}

        <div className="pt-4 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono">
          {!isCollapsed ? 'Configuration' : '•••'}
        </div>

        {bottomItems.map((item) => {
          const Icon = item.icon
          const isActive = location.pathname === item.path

          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setSidebarMobileOpen(false)}
              className={`
                group flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-semibold transition-all duration-200
                ${
                  isActive
                    ? 'bg-indigo-600/15 text-indigo-300 border border-indigo-500/30'
                    : 'text-slate-400 hover:bg-white/[0.04] hover:text-slate-200'
                }
              `}
              title={isCollapsed ? item.label : undefined}
            >
              <Icon
                className={`h-4 w-4 shrink-0 transition-transform group-hover:scale-110 ${
                  isActive ? 'text-indigo-400' : 'text-slate-400 group-hover:text-slate-200'
                }`}
              />
              {!isCollapsed && <span className="truncate">{item.label}</span>}
            </NavLink>
          )
        })}
      </nav>

      {/* Footer / Demo badge & Theme switcher */}
      <div className="border-t border-white/[0.08] p-3 space-y-2 bg-[#030610]">
        {!isCollapsed && (
          <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span className="font-semibold text-indigo-300">HackQubit Demo</span>
            </div>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-live" />
          </div>
        )}

        <div className="flex items-center justify-between px-1">
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-white/[0.06] transition-colors"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-400" />}
            {!isCollapsed && <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>}
          </button>

          {isCollapsed && (
            <button
              onClick={toggleSidebar}
              className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors"
              title="Expand Sidebar"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </aside>
  )
}
