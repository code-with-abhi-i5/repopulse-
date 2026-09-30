import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useEffect } from 'react'
import { useUIStore, useDemoStore, useNotificationStore, useRealtimeStore } from './stores'
import { mockNotifications, mockActivityEvents } from './data/mock'
import { useRealtimeSocket } from './hooks/useRealtimeSocket'
import LandingPage from './pages/LandingPage.jsx'
import DashboardLayout from './components/layout/DashboardLayout.jsx'
import DashboardPage from './pages/DashboardPage.jsx'
import RepositoriesPage from './pages/RepositoriesPage.jsx'
import RepositoryDetailPage from './pages/RepositoryDetailPage.jsx'
import ContributorsPage from './pages/ContributorsPage.jsx'
import PullRequestsPage from './pages/PullRequestsPage.jsx'
import IssuesPage from './pages/IssuesPage.jsx'
import AnalyticsPage from './pages/AnalyticsPage.jsx'
import AlertsPage from './pages/AlertsPage.jsx'
import ReportsPage from './pages/ReportsPage.jsx'
import SettingsPage from './pages/SettingsPage.jsx'
import ActivityPage from './pages/ActivityPage.jsx'

function DemoInitializer() {
  const { isDemoMode } = useDemoStore()
  const { setNotifications } = useNotificationStore()
  const { setLiveEvents, setConnectionStatus } = useRealtimeStore()

  useEffect(() => {
    if (isDemoMode) {
      setNotifications(mockNotifications)
      setLiveEvents(mockActivityEvents)
      setConnectionStatus('demo')
    }
  }, [isDemoMode])

  return null
}

function ThemeManager() {
  const { theme } = useUIStore()

  useEffect(() => {
    const root = document.documentElement
    if (theme === 'system') {
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      root.className = isDark ? 'dark' : 'light'
    } else {
      root.className = theme
    }
  }, [theme])

  return null;
}

function RealtimeManager() {
  useRealtimeSocket();
  return null;
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeManager />
      <DemoInitializer />
      <RealtimeManager />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/repositories" element={<RepositoriesPage />} />
          <Route path="/repositories/:owner/:repo" element={<RepositoryDetailPage />} />
          <Route path="/repositories/:owner/:repo/*" element={<RepositoryDetailPage />} />
          <Route path="/activity" element={<ActivityPage />} />
          <Route path="/contributors" element={<ContributorsPage />} />
          <Route path="/pull-requests" element={<PullRequestsPage />} />
          <Route path="/issues" element={<IssuesPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/alerts" element={<AlertsPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
