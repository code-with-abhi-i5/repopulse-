import { useState, useEffect } from 'react'
import { api } from '../lib/api'
import { formatRelativeTime } from '../lib/utils'
import { useNotificationStore } from '../stores'
import {
  Bell,
  Plus,
  AlertTriangle,
  AlertCircle,
  Info,
  CheckCircle2,
  Trash2,
  Play,
  Pause,
  Send,
  Sliders,
  X,
  ExternalLink,
  ShieldAlert,
  Zap,
} from 'lucide-react'

const channelBadgeColors = {
  discord: 'bg-[#5865F2]/10 text-[#5865F2] border-[#5865F2]/20',
  slack: 'bg-[#4A154B]/10 text-[#E01E5A] border-[#E01E5A]/20',
  email: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
  telegram: 'bg-[#229ED9]/10 text-[#229ED9] border-[#229ED9]/20',
}

const severityBadgeColors = {
  critical: 'bg-rose-500/10 text-rose-500 border-rose-500/20',
  warning: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  info: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
}

export default function AlertsPage() {
  const { addNotification } = useNotificationStore()
  const [alertRules, setAlertRules] = useState([])
  const [incidents, setIncidents] = useState([])
  const [repositories, setRepositories] = useState([])
  const [isRuleModalOpen, setIsRuleModalOpen] = useState(false)
  const [testSent, setTestSent] = useState(false)

  useEffect(() => {
    api.getAlerts().then((data) => setIncidents(data || [])).catch(() => setIncidents([]))
    api.getRepositories().then((data) => setRepositories(data || [])).catch(() => setRepositories([]))
  }, [])

  // New rule form state
  const [newRule, setNewRule] = useState({
    name: '',
    event: 'workflow_failure',
    repositoryId: '',
    channel: 'discord',
    severity: 'critical',
    throttleMinutes: 15,
  })

  // Toggle active/paused rule
  const toggleRuleState = (id) => {
    setAlertRules((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, state: r.state === 'active' ? 'paused' : 'active' } : r
      )
    )
  }

  // Delete rule
  const deleteRule = (id) => {
    setAlertRules((prev) => prev.filter((r) => r.id !== id))
  }

  // Create rule
  const handleCreateRule = (e) => {
    e.preventDefault()
    const targetRepo = repositories.find((r) => r.id === newRule.repositoryId)
    const rule = {
      id: `alert-rule-${Date.now()}`,
      name: newRule.name || 'Custom Alert Rule',
      event: newRule.event,
      condition: `${newRule.event} == triggered`,
      repositoryId: newRule.repositoryId,
      repositoryName: targetRepo?.fullName || 'All Repositories',
      channel: newRule.channel,
      severity: newRule.severity,
      state: 'active',
      throttleMinutes: newRule.throttleMinutes,
      quietHoursStart: null,
      quietHoursEnd: null,
      createdAt: new Date().toISOString(),
      lastTriggeredAt: null,
    }

    setAlertRules([rule, ...alertRules])
    setIsRuleModalOpen(false)
    setNewRule({
      name: '',
      event: 'workflow_failure',
      repositoryId: repositories[0]?.id || '',
      channel: 'discord',
      severity: 'critical',
      throttleMinutes: 15,
    })
  }

  // Trigger test alert
  const handleTestAlert = () => {
    const testIncident = {
      id: `alert-${Date.now()}`,
      ruleId: 'alert-rule-test',
      type: 'test_trigger',
      severity: 'warning',
      repository: 'Zectral/repopulse',
      message: 'Simulated alert dispatch verified across webhook pipeline',
      channel: 'discord',
      createdAt: new Date().toISOString(),
      read: false,
    }

    setIncidents([testIncident, ...incidents])
    addNotification({
      id: `notif-${Date.now()}`,
      severity: 'warning',
      title: 'Alert Fired: Test Trigger',
      description: 'Simulated alert successfully dispatched to Discord channel.',
      timestamp: new Date().toISOString(),
      read: false,
      repositoryName: 'Zectral/repopulse',
    })

    setTestSent(true)
    setTimeout(() => setTestSent(false), 2500)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <Bell className="w-7 h-7 text-primary" />
            Alert Engine & Notification Rules
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Configure automated event monitors for CI breaks, force-pushes, star spikes, and stale pull requests.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleTestAlert}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium bg-secondary hover:bg-secondary/80 text-foreground border border-border transition-colors"
          >
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            {testSent ? 'Dispatched!' : 'Fire Test Alert'}
          </button>

          <button
            onClick={() => setIsRuleModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-all shadow-xs"
          >
            <Plus className="w-4 h-4" />
            New Alert Rule
          </button>
        </div>
      </div>

      {/* Alert Rules Section */}
      <div className="p-6 rounded-2xl bg-card border border-border shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-primary" />
              Active Monitoring Rules ({alertRules.length})
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Conditions evaluated continuously against incoming GitHub webhook webhooks
            </p>
          </div>
        </div>

        <div className="divide-y divide-border/60">
          {alertRules.length === 0 ? (
            <div className="py-8 text-center text-xs text-muted-foreground">
              No alert rules defined yet. Click "Add Alert Rule" to create automated triggers.
            </div>
          ) : (
            alertRules.map((rule) => {
            const isActive = rule.state === 'active'
            return (
              <div
                key={rule.id}
                className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-muted/20 px-2 rounded-xl transition-colors"
              >
                <div className="flex items-start gap-3.5">
                  <button
                    onClick={() => toggleRuleState(rule.id)}
                    className={`mt-1 p-2 rounded-lg transition-colors ${
                      isActive ? 'bg-emerald-500/10 text-emerald-500' : 'bg-muted text-muted-foreground'
                    }`}
                    title={isActive ? 'Click to Pause' : 'Click to Activate'}
                  >
                    {isActive ? <Play className="w-4 h-4 fill-emerald-500" /> : <Pause className="w-4 h-4" />}
                  </button>

                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-bold text-foreground">{rule.name}</span>
                      <span className={`px-2 py-0.2 rounded text-[10px] font-semibold uppercase ${severityBadgeColors[rule.severity]}`}>
                        {rule.severity}
                      </span>
                      <span className={`px-2 py-0.2 rounded text-[10px] font-semibold uppercase ${channelBadgeColors[rule.channel]}`}>
                        {rule.channel}
                      </span>
                      <span className="text-xs text-muted-foreground font-mono">
                        {rule.repositoryName}
                      </span>
                    </div>

                    <p className="text-xs text-muted-foreground font-mono mt-1">
                      Condition: <span className="text-foreground">{rule.condition}</span> • Throttle: {rule.throttleMinutes}m
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 self-end md:self-center">
                  <span className="text-xs text-muted-foreground">
                    {rule.lastTriggeredAt
                      ? `Last triggered ${formatRelativeTime(rule.lastTriggeredAt)}`
                      : 'Never triggered'}
                  </span>

                  <button
                    onClick={() => deleteRule(rule.id)}
                    className="p-1.5 rounded-lg text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                    title="Delete rule"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )
          }))}
        </div>
      </div>

      {/* Recent Incidents Feed */}
      <div className="p-6 rounded-2xl bg-card border border-border shadow-xs space-y-4">
        <h3 className="text-base font-bold text-foreground flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-rose-500" />
          Recent Alert Incidents & Delivery Log
        </h3>

        <div className="divide-y divide-border/60">
          {incidents.length === 0 ? (
            <div className="py-8 text-center text-xs text-muted-foreground">
              No recent alert incidents recorded.
            </div>
          ) : (
            incidents.map((inc) => (
            <div key={inc.id} className="py-3.5 flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div
                  className={`mt-0.5 p-1.5 rounded-lg shrink-0 ${
                    inc.severity === 'critical'
                      ? 'bg-rose-500/10 text-rose-500'
                      : inc.severity === 'warning'
                      ? 'bg-amber-500/10 text-amber-500'
                      : 'bg-blue-500/10 text-blue-500'
                  }`}
                >
                  <AlertTriangle className="w-4 h-4" />
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-foreground">{inc.message}</span>
                    <span className={`px-2 py-0.2 rounded text-[10px] font-semibold uppercase ${channelBadgeColors[inc.channel] || 'bg-secondary text-foreground'}`}>
                      {inc.channel}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground font-mono mt-0.5 block">
                    {inc.repository}
                  </span>
                </div>
              </div>

              <span className="text-xs text-muted-foreground whitespace-nowrap">
                {formatRelativeTime(inc.createdAt)}
              </span>
            </div>
          )))}
        </div>
      </div>

      {/* Modal: Create Alert Rule */}
      {isRuleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg p-6 rounded-2xl bg-card border border-border shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-primary" />
                <h3 className="text-base font-bold text-foreground">Configure New Alert Rule</h3>
              </div>
              <button
                onClick={() => setIsRuleModalOpen(false)}
                className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateRule} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">Rule Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., CI Build Failure on Main"
                  value={newRule.name}
                  onChange={(e) => setNewRule({ ...newRule, name: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm rounded-lg bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary text-foreground"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">Trigger Event</label>
                  <select
                    value={newRule.event}
                    onChange={(e) => setNewRule({ ...newRule, event: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg bg-background border border-border text-foreground"
                  >
                    <option value="workflow_failure">CI/CD Workflow Failure</option>
                    <option value="commit_spike">Commit Spike (&gt;2.5x baseline)</option>
                    <option value="force_push">Force Push Detected</option>
                    <option value="star_spike">Star Spike (&gt;10/hr)</option>
                    <option value="stale_pr">Stale PR without Review</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">Target Repository</label>
                  <select
                    value={newRule.repositoryId}
                    onChange={(e) => setNewRule({ ...newRule, repositoryId: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg bg-background border border-border text-foreground"
                  >
                    <option value="">Select a repository</option>
                    {repositories.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.fullName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">Dispatch Channel</label>
                  <select
                    value={newRule.channel}
                    onChange={(e) => setNewRule({ ...newRule, channel: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg bg-background border border-border text-foreground"
                  >
                    <option value="discord">Discord Webhook</option>
                    <option value="slack">Slack Incoming</option>
                    <option value="email">Developer Email</option>
                    <option value="telegram">Telegram Bot</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">Severity</label>
                  <select
                    value={newRule.severity}
                    onChange={(e) => setNewRule({ ...newRule, severity: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg bg-background border border-border text-foreground"
                  >
                    <option value="critical">Critical</option>
                    <option value="warning">Warning</option>
                    <option value="info">Info</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsRuleModalOpen(false)}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  Save Alert Rule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
