import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar.jsx'
import Header from './Header.jsx'
import CommandPalette from '../CommandPalette.jsx'
import NotificationDrawer from '../NotificationDrawer.jsx'
import { useUIStore } from '../../stores'

export default function DashboardLayout() {
  const { sidebarCollapsed, sidebarMobileOpen, setSidebarMobileOpen } = useUIStore()

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Mobile overlay */}
      {sidebarMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <Sidebar />

      {/* Main area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>

      {/* Global overlays */}
      <CommandPalette />
      <NotificationDrawer />
    </div>
  )
}
