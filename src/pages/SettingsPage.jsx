import { useState } from 'react'
import { useUIStore, useDemoStore } from '../stores'
import Github from '../components/icons/Github.jsx'
import {
  Settings,
  Key,
  Bell,
  Palette,
  Shield,
  RefreshCw,
  Check,
  Save,
  Radio,
  ExternalLink,
  Sliders,
  Sparkles,
} from 'lucide-react'

export default function SettingsPage() {
  const { theme, setTheme } = useUIStore()
  const { isDemoMode, setDemoMode, resetDemoState } = useDemoStore()

  // Form states
  const [githubPat, setGithubPat] = useState('ghp_************************************')
  const [webhookUrl, setWebhookUrl] = useState('https://api.repopulse.dev/webhooks/github')
  const [discordWebhook, setDiscordWebhook] = useState('https://discord.com/api/webhooks/12345/abcdef')
  const [slackWebhook, setSlackWebhook] = useState('')
  const [notificationEmail, setNotificationEmail] = useState('abhi@example.com')
  const [isSaved, setIsSaved] = useState(false)
  const [isTestingWebhook, setIsTestingWebhook] = useState(false)
  const [webhookStatus, setWebhookStatus] = useState(null)

  const handleSave = (e) => {
    e.preventDefault()
    setIsSaved(true)
    setTimeout(() => setIsSaved(false), 2500)
  }

  const handleTestWebhook = () => {
    setIsTestingWebhook(true)
    setWebhookStatus(null)
    setTimeout(() => {
      setIsTestingWebhook(false)
      setWebhookStatus('200 OK — Ping event delivered')
    }, 1200)
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
          <Settings className="w-7 h-7 text-primary" />
          Settings & Integrations
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage GitHub API credentials, webhook endpoints, notification channels, and demo simulations.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 1: GitHub Connection */}
        <div className="p-6 rounded-2xl bg-card border border-border shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div className="flex items-center gap-2.5">
              <Github className="w-5 h-5 text-primary" />
              <h3 className="text-base font-bold text-foreground">GitHub Integration & Token</h3>
            </div>
            <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              Connected (Demo API)
            </span>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">
                Personal Access Token (Classic or Fine-Grained)
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={githubPat}
                  onChange={(e) => setGithubPat(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-lg bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary font-mono text-foreground"
                />
              </div>
              <span className="text-[11px] text-muted-foreground mt-1 block">
                Required permissions: <code className="text-primary font-mono">repo</code>, <code className="text-primary font-mono">read:org</code>, <code className="text-primary font-mono">workflow</code>, <code className="text-primary font-mono">admin:repo_hook</code>
              </span>
            </div>
          </div>
        </div>

        {/* Section 2: Webhooks */}
        <div className="p-6 rounded-2xl bg-card border border-border shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div className="flex items-center gap-2.5">
              <Radio className="w-5 h-5 text-primary" />
              <h3 className="text-base font-bold text-foreground">GitHub Webhook Dispatcher</h3>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">Payload URL</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  className="flex-1 px-3.5 py-2 text-sm rounded-lg bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary font-mono text-foreground"
                />
                <button
                  type="button"
                  onClick={handleTestWebhook}
                  disabled={isTestingWebhook}
                  className="px-4 py-2 rounded-lg text-xs font-medium bg-secondary text-foreground hover:bg-secondary/80 border border-border transition-colors disabled:opacity-50"
                >
                  {isTestingWebhook ? 'Pinging...' : 'Test Webhook'}
                </button>
              </div>
              {webhookStatus && (
                <span className="text-xs text-emerald-500 font-mono mt-1.5 block">
                  ✓ {webhookStatus}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Section 3: Notification Channels */}
        <div className="p-6 rounded-2xl bg-card border border-border shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 border-b border-border pb-3">
            <Bell className="w-5 h-5 text-primary" />
            <h3 className="text-base font-bold text-foreground">Notification Channels</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">Discord Webhook</label>
              <input
                type="text"
                placeholder="https://discord.com/api/webhooks/..."
                value={discordWebhook}
                onChange={(e) => setDiscordWebhook(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-lg bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary text-foreground"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">Slack Webhook</label>
              <input
                type="text"
                placeholder="https://hooks.slack.com/services/..."
                value={slackWebhook}
                onChange={(e) => setSlackWebhook(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-lg bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary text-foreground"
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-xs font-semibold text-foreground block mb-1">Alert Email Address</label>
              <input
                type="email"
                value={notificationEmail}
                onChange={(e) => setNotificationEmail(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-lg bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary text-foreground"
              />
            </div>
          </div>
        </div>

        {/* Section 4: Demo Mode & Simulation */}
        <div className="p-6 rounded-2xl bg-card border border-border shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-5 h-5 text-primary" />
              <h3 className="text-base font-bold text-foreground">Hackathon Demo Mode</h3>
            </div>
            <button
              type="button"
              onClick={() => setDemoMode(!isDemoMode)}
              className={`px-3 py-1 rounded-full text-xs font-semibold border transition-colors ${
                isDemoMode
                  ? 'bg-primary/20 text-primary border-primary/30'
                  : 'bg-secondary text-muted-foreground border-border'
              }`}
            >
              {isDemoMode ? 'Demo Mode Active' : 'Live Mode'}
            </button>
          </div>

          <div className="space-y-3">
            <p className="text-xs text-muted-foreground leading-relaxed">
              In demo mode, RepoPulse synthesizes high-velocity simulated GitHub events, real-time activity pulses, commit spikes, and test alerts for hackathon presentation without depleting GitHub rate limits.
            </p>

            <button
              type="button"
              onClick={resetDemoState}
              className="flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium bg-secondary hover:bg-secondary/80 text-foreground border border-border transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Reset Demo State & Refresh Mock Datasets
            </button>
          </div>
        </div>

        {/* Section 5: Theme & Appearance */}
        <div className="p-6 rounded-2xl bg-card border border-border shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 border-b border-border pb-3">
            <Palette className="w-5 h-5 text-primary" />
            <h3 className="text-base font-bold text-foreground">Interface Appearance</h3>
          </div>

          <div className="flex items-center gap-3">
            {[
              { id: 'dark', label: 'Dark Mode' },
              { id: 'light', label: 'Light Mode' },
              { id: 'system', label: 'System Default' },
            ].map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTheme(t.id)}
                className={`px-4 py-2 rounded-xl text-xs font-medium border transition-colors ${
                  theme === t.id
                    ? 'bg-primary text-primary-foreground border-primary shadow-xs'
                    : 'bg-secondary text-muted-foreground border-border hover:text-foreground'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-end gap-3 pt-4">
          {isSaved && (
            <span className="flex items-center gap-1.5 text-xs text-emerald-500 font-medium animate-in fade-in">
              <Check className="w-4 h-4" />
              Settings saved successfully!
            </span>
          )}
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-all shadow-md shadow-primary/20"
          >
            <Save className="w-4 h-4" />
            Save Preferences
          </button>
        </div>
      </form>
    </div>
  )
}
