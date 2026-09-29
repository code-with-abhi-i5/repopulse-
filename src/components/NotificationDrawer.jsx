import { useUIStore, useNotificationStore } from '../stores'
import { formatRelativeTime } from '../lib/utils'
import { X, AlertTriangle, AlertCircle, Info, Check } from 'lucide-react'

const severityConfig = {
  critical: { icon: AlertTriangle, color: 'text-danger', bg: 'bg-danger-muted', border: 'border-danger/20' },
  warning: { icon: AlertCircle, color: 'text-warning', bg: 'bg-warning-muted', border: 'border-warning/20' },
  info: { icon: Info, color: 'text-info', bg: 'bg-info-muted', border: 'border-info/20' },
}

export default function NotificationDrawer() {
  const { notificationDrawerOpen, setNotificationDrawerOpen } = useUIStore()
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotificationStore()

  if (!notificationDrawerOpen) return null

  return (
    <div className="fixed inset-0 z-[90]">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={() => setNotificationDrawerOpen(false)}
      />

      {/* Drawer */}
      <div className="absolute right-0 top-0 h-full w-full max-w-md border-l border-border bg-surface animate-slide-in-right flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div>
            <h2 className="text-lg font-semibold text-text-primary">Notifications</h2>
            <p className="text-xs text-text-muted mt-0.5">{unreadCount} unread</p>
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="rounded-lg px-2.5 py-1 text-xs font-medium text-accent hover:bg-accent-muted transition-colors"
              >
                Mark all read
              </button>
            )}
            <button
              onClick={() => setNotificationDrawerOpen(false)}
              className="rounded-lg p-1.5 text-text-muted hover:bg-surface-hover hover:text-text-primary"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Notifications list */}
        <div className="flex-1 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-text-muted">
              <Check className="h-10 w-10 mb-3 opacity-40" />
              <p className="text-sm font-medium">All caught up!</p>
              <p className="text-xs mt-1">No new notifications</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {notifications.map((notif) => {
                const config = severityConfig[notif.severity] || severityConfig.info
                const Icon = config.icon

                return (
                  <button
                    key={notif.id}
                    onClick={() => markAsRead(notif.id)}
                    className={`w-full text-left px-5 py-3.5 hover:bg-surface-hover transition-colors ${
                      !notif.read ? 'bg-surface-elevated/50' : ''
                    }`}
                  >
                    <div className="flex gap-3">
                      <div className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${config.bg}`}>
                        <Icon className={`h-3.5 w-3.5 ${config.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className={`text-sm font-medium ${!notif.read ? 'text-text-primary' : 'text-text-secondary'}`}>
                            {notif.title}
                          </p>
                          {!notif.read && (
                            <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-accent" />
                          )}
                        </div>
                        <p className="text-xs text-text-muted mt-0.5 line-clamp-2">{notif.description}</p>
                        <div className="flex items-center gap-2 mt-1.5">
                          {notif.repositoryName && (
                            <span className="text-[10px] font-medium text-text-muted bg-surface-elevated rounded px-1.5 py-0.5">
                              {notif.repositoryName}
                            </span>
                          )}
                          <span className="text-[10px] text-text-muted">
                            {formatRelativeTime(notif.timestamp)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
