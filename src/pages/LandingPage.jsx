import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useDemoStore, useRealtimeStore } from '../stores'
import Github from '../components/icons/Github.jsx'
import Hero3DTiltCard from '../components/Hero3DTiltCard.jsx'
import HeroBackground from '../components/HeroBackground.jsx'
import { api } from '../lib/api'
import {
  Zap,
  Activity,
  Shield,
  ShieldCheck,
  Lock,
  Users,
  GitPullRequest,
  BarChart3,
  Bell,
  ArrowRight,
  Star,
  GitFork,
  ChevronRight,
  Clock,
  Sparkles,
  GitCommit,
  CheckCircle2,
  Terminal,
  Layers,
  Play,
  Radio,
  Flame,
  ExternalLink,
  ChevronDown,
  Check,
  RefreshCw,
  FolderGit2,
  Menu,
  X,
} from 'lucide-react'

export default function LandingPage() {
  const navigate = useNavigate()
  const { setDemoMode } = useDemoStore()
  const { addLiveEvent } = useRealtimeStore()

  // State for animated metrics
  const [healthScore, setHealthScore] = useState(0)
  const [pulseTrigger, setPulseTrigger] = useState(0)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [activeCockpitTab, setActiveCockpitTab] = useState('fleet')
  const [selectedAlertChannel, setSelectedAlertChannel] = useState('slack')
  const [simulatedToast, setSimulatedToast] = useState(null)
  const [openFaq, setOpenFaq] = useState(null)
  const [copiedCurl, setCopiedCurl] = useState(false)
  const [repositories, setRepositories] = useState([])
  const [contributors, setContributors] = useState([])

  useEffect(() => {
    api.getRepositories().then((data) => setRepositories(data || [])).catch(() => {})
    api.getContributors().then((data) => setContributors(data || [])).catch(() => {})
  }, [])

  // Dynamic live event stream inside the cockpit
  const [liveStreamEvents, setLiveStreamEvents] = useState([
    {
      id: 'e1',
      actor: 'Abhi Ghosh',
      avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=abhi',
      action: 'Merged PR #84: Algorithmic Health Engine',
      repo: 'repopulse',
      time: 'Just now',
      type: 'PR_MERGED',
      badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    },
    {
      id: 'e2',
      actor: 'Priya Sharma',
      avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=priya',
      action: 'Pushed 4 commits to feature/realtime-ws',
      repo: 'the-grocery-hub',
      time: '14s ago',
      type: 'PUSH',
      badgeColor: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    },
    {
      id: 'e3',
      actor: 'Rahul Kumar',
      avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=rahul',
      action: 'CI workflow build completed on main (99.8%)',
      repo: 'agentic-ai-platform',
      time: '48s ago',
      type: 'WORKFLOW',
      badgeColor: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
    },
  ])

  // Animated health counter
  useEffect(() => {
    let current = 0
    const target = 94
    const interval = setInterval(() => {
      current += 2
      if (current >= target) {
        current = target
        clearInterval(interval)
      }
      setHealthScore(current)
    }, 20)
    return () => clearInterval(interval)
  }, [])

  // Auto-dismiss simulation toast
  useEffect(() => {
    if (simulatedToast) {
      const timer = setTimeout(() => setSimulatedToast(null), 4000)
      return () => clearTimeout(timer)
    }
  }, [simulatedToast])

  const handleLaunch = () => {
    setDemoMode(true)
    navigate('/dashboard')
  }

  // Interactive webhook event simulator
  const handleSimulateWebhook = (type) => {
    const timestamp = 'Just now'
    let newEvent

    if (type === 'push') {
      newEvent = {
        id: `e-${Date.now()}`,
        actor: 'Abhi Ghosh',
        avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=abhi',
        action: 'Pushed commit: chore(ci): update release telemetry pipeline',
        repo: 'repopulse',
        time: timestamp,
        type: 'PUSH',
        badgeColor: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
      }
      setSimulatedToast({
        title: 'Git Push Event Received',
        desc: 'repopulse • 1 new commit processed in 38ms',
        type: 'success',
      })
    } else if (type === 'pr') {
      newEvent = {
        id: `e-${Date.now()}`,
        actor: 'Sneha Patel',
        avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=sneha',
        action: 'Opened PR #104: Add multi-region WebSocket failover',
        repo: 'the-grocery-hub',
        time: timestamp,
        type: 'PR_OPEN',
        badgeColor: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
      }
      setSimulatedToast({
        title: 'PR Triage Triggered',
        desc: 'the-grocery-hub • Latency SLA tracker started',
        type: 'info',
      })
    } else {
      newEvent = {
        id: `e-${Date.now()}`,
        actor: 'GitHub Actions',
        avatar: 'https://api.dicebear.com/9.x/bottts/svg?seed=actions',
        action: 'Alert: Memory spike detected during integration tests',
        repo: 'agentic-ai-platform',
        time: timestamp,
        type: 'ALERT',
        badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      }
      setSimulatedToast({
        title: 'Alert Dispatched',
        desc: 'agentic-ai-platform • Notification broadcast to #eng-ops',
        type: 'warning',
      })
    }

    setLiveStreamEvents((prev) => [newEvent, ...prev.slice(0, 4)])
    setPulseTrigger((p) => p + 1)
    if (addLiveEvent) {
      addLiveEvent(newEvent)
    }
  }

  const copyWebhookCurl = () => {
    navigator.clipboard?.writeText(
      'curl -X POST https://api.repopulse.dev/v1/telemetry \\\n  -H "Authorization: Bearer rp_live_test_779" \\\n  -d \'{"event": "push", "repository": "Zectral/repopulse"}\''
    )
    setCopiedCurl(true)
    setTimeout(() => setCopiedCurl(false), 2000)
  }

  const languageColors = {
    TypeScript: 'bg-blue-400',
    Python: 'bg-amber-400',
    Go: 'bg-cyan-400',
    JavaScript: 'bg-yellow-400',
  }

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 relative overflow-x-hidden font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Next-Level Futuristic Hero Background System */}
      <HeroBackground />

      {/* Lower Page Ambient Lighting */}
      <div className="ambient-glow top-[1400px] -right-60 w-[750px] h-[750px] bg-purple-600/12 pointer-events-none" />
      <div className="ambient-glow bottom-0 left-1/3 w-[600px] h-[600px] bg-indigo-600/10 pointer-events-none" />

      {/* Floating Simulation Toast */}
      {simulatedToast && (
        <div className="fixed bottom-6 right-6 z-50 max-w-sm w-full p-4 rounded-xl glass-card border border-indigo-500/40 shadow-2xl shadow-indigo-500/20 animate-in slide-in-from-bottom-5 duration-300 flex items-start gap-3">
          <div
            className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
              simulatedToast.type === 'warning'
                ? 'bg-amber-500/20 text-amber-400'
                : simulatedToast.type === 'info'
                ? 'bg-purple-500/20 text-purple-400'
                : 'bg-emerald-500/20 text-emerald-400'
            }`}
          >
            <Radio className="w-4 h-4 animate-pulse" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-xs font-bold text-white tracking-wide">{simulatedToast.title}</h4>
            <p className="text-xs text-slate-300 mt-0.5 font-mono">{simulatedToast.desc}</p>
          </div>
          <button
            onClick={() => setSimulatedToast(null)}
            className="text-slate-400 hover:text-white text-xs px-1"
          >
            ✕
          </button>
        </div>
      )}

      {/* Floating Island Navigation Dock */}
      <header className="sticky top-4 z-50 max-w-6xl mx-auto px-4 sm:px-6">
        <nav className="relative rounded-2xl sm:rounded-full bg-slate-950/80 border border-white/[0.12] backdrop-blur-2xl shadow-2xl shadow-black/80 px-4 sm:px-6 h-16 flex items-center justify-between transition-all">
          {/* Subtle Ambient Island Aura */}
          <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500/20 via-violet-500/20 to-cyan-500/20 rounded-2xl sm:rounded-full blur-sm opacity-50 -z-10 pointer-events-none" />

          {/* Left: Brand Identity */}
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-2.5 sm:gap-3 group shrink-0">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/40 ring-1 ring-white/20 group-hover:scale-105 group-hover:rotate-6 transition-all duration-300">
                <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-base sm:text-lg font-bold tracking-tight text-white group-hover:text-indigo-200 transition-colors">
                  Repo<span className="text-indigo-400">Pulse</span>
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-live" />
                  v2.4 PRO
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links (Pill Style) */}
            <div className="hidden md:flex items-center gap-1 pl-2 border-l border-white/10 text-xs font-semibold text-slate-300">
              <a
                href="#cockpit"
                className="px-3.5 py-1.5 rounded-full hover:text-white hover:bg-white/[0.08] transition-all"
              >
                Fleet Cockpit
              </a>
              <a
                href="#capabilities"
                className="px-3.5 py-1.5 rounded-full hover:text-white hover:bg-white/[0.08] transition-all"
              >
                Capabilities
              </a>
              <a
                href="#faq"
                className="px-3.5 py-1.5 rounded-full hover:text-white hover:bg-white/[0.08] transition-all"
              >
                FAQ
              </a>
            </div>
          </div>

          {/* Right Action Cluster */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Live Telemetry Ping Indicator */}
            <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-[11px] font-mono font-semibold text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-live" />
              <span>TLS 1.3 (24ms)</span>
            </div>

            {/* GitHub Stars Button */}
            <a
              href="https://github.com/Zectral/repopulse"
              target="_blank"
              rel="noreferrer"
              className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 hover:bg-slate-800 border border-white/10 hover:border-white/20 text-xs font-semibold text-slate-200 transition-all shadow-sm hover:scale-[1.02]"
            >
              <Github className="w-3.5 h-3.5" />
              <span>GitHub</span>
              <span className="text-[10px] font-mono text-amber-400 flex items-center gap-0.5 pl-1 border-l border-white/10">
                <Star className="w-3 h-3 fill-amber-400" />
                1,248
              </span>
            </a>

            {/* Admin Sign In CTA */}
            <Link
              to="/login"
              className="flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-full text-xs font-semibold text-slate-300 hover:text-white bg-slate-900/90 hover:bg-slate-800 border border-white/10 hover:border-white/20 transition-all shadow-sm"
            >
              <Lock className="w-3.5 h-3.5 text-indigo-400" />
              <span>Admin Login</span>
            </Link>

            {/* Next-Level Launch CTA */}
            <button
              onClick={handleLaunch}
              className="group flex items-center gap-2 px-4 sm:px-5 py-2 rounded-full text-xs font-bold text-white bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 shadow-lg shadow-indigo-500/35 border border-indigo-400/30 transition-all hover:scale-105 active:scale-95 btn-glow"
            >
              <span>Cockpit</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </button>

            {/* Mobile Menu Toggle Button */}
            <button
              onClick={() => setMobileNavOpen((prev) => !prev)}
              className="md:hidden p-2 rounded-full bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
              aria-label="Toggle navigation menu"
            >
              {mobileNavOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </nav>

        {/* Mobile Dropdown Menu (AnimatePresence) */}
        <AnimatePresence>
          {mobileNavOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              className="md:hidden mt-2 p-4 rounded-2xl bg-slate-950/95 border border-white/15 backdrop-blur-2xl shadow-2xl space-y-3"
            >
              <div className="flex flex-col space-y-1 text-sm font-medium text-slate-200">
                <a
                  href="#cockpit"
                  onClick={() => setMobileNavOpen(false)}
                  className="px-3 py-2 rounded-xl hover:bg-white/10 transition-colors"
                >
                  Fleet Cockpit
                </a>
                <a
                  href="#capabilities"
                  onClick={() => setMobileNavOpen(false)}
                  className="px-3 py-2 rounded-xl hover:bg-white/10 transition-colors"
                >
                  Capabilities
                </a>
                <a
                  href="#faq"
                  onClick={() => setMobileNavOpen(false)}
                  className="px-3 py-2 rounded-xl hover:bg-white/10 transition-colors"
                >
                  FAQ
                </a>
              </div>

              <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                <a
                  href="https://github.com/Zectral/repopulse"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 text-xs font-medium text-slate-300 hover:text-white"
                >
                  <Github className="w-4 h-4" />
                  <span>GitHub ★ 1,248</span>
                </a>

                <div className="flex items-center gap-1.5 text-[11px] font-mono text-emerald-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-live" />
                  <span>TLS 1.3</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Main Hero Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pt-16 md:pt-24 pb-16">
        <motion.div
          initial="hidden"
          animate="show"
          variants={{
            hidden: { opacity: 0 },
            show: {
              opacity: 1,
              transition: {
                staggerChildren: 0.1,
                delayChildren: 0.05,
              },
            },
          }}
          className="flex flex-col items-center text-center max-w-4xl mx-auto"
        >
          {/* Top Pill / HackQubit Badge */}
          <motion.div
            variants={{
              hidden: { opacity: 0, y: 15 },
              show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
            }}
            animate={{ y: [0, -3, 0] }}
            transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
            onClick={handleLaunch}
            className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-slate-900/90 border border-indigo-500/30 hover:border-indigo-400 text-xs text-slate-300 transition-all cursor-pointer shadow-lg shadow-indigo-500/10 mb-8 group backdrop-blur-xl"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-live" />
            <span className="font-semibold text-white">HackQubit 2026 Champion Edition</span>
            <span className="text-slate-600">•</span>
            <span className="text-indigo-400 group-hover:text-indigo-300 group-hover:translate-x-0.5 transition-all flex items-center gap-1 font-semibold">
              Explore Live Mission Control <ChevronRight className="w-3.5 h-3.5" />
            </span>
          </motion.div>

          {/* Main Hero Headline */}
          <motion.h1
            variants={{
              hidden: { opacity: 0, y: 25 },
              show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } },
            }}
            className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white leading-[1.08] mb-6"
          >
            Autonomous Mission Control for{' '}
            <span className="gradient-accent-text">High-Velocity</span> Engineering Teams.
          </motion.h1>

          {/* Hero Subheadline */}
          <motion.p
            variants={{
              hidden: { opacity: 0, y: 20 },
              show: { opacity: 1, y: 0, transition: { duration: 0.6 } },
            }}
            className="text-base sm:text-lg md:text-xl text-slate-300 max-w-2xl leading-relaxed mb-10"
          >
            RepoPulse synthesizes repository commits, review latency SLAs, CI failure telemetry, and
            contributor streak dynamics into a unified executive cockpit.
          </motion.p>

          {/* Primary Action Buttons */}
          <motion.div
            variants={{
              hidden: { opacity: 0, y: 20 },
              show: { opacity: 1, y: 0, transition: { duration: 0.6 } },
            }}
            className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto justify-center mb-14"
          >
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleLaunch}
              className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-8 py-4 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 shadow-xl shadow-indigo-500/30 transition-all btn-glow"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Launch Live Cockpit</span>
              <span className="ml-1 text-[11px] font-mono px-2 py-0.5 rounded bg-white/20 text-white font-medium">
                Instant Demo
              </span>
            </motion.button>

            <motion.a
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              href="https://github.com/Zectral/repopulse"
              target="_blank"
              rel="noreferrer"
              className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-7 py-4 rounded-xl font-medium text-sm text-slate-200 bg-slate-900/80 hover:bg-slate-800 border border-white/10 hover:border-white/20 transition-all shadow-md"
            >
              <Github className="w-4 h-4" />
              <span>Inspect Source Repository</span>
            </motion.a>

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                handleSimulateWebhook('push')
              }}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-4 rounded-xl font-medium text-xs text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 hover:border-indigo-500/40 transition-all"
            >
              <Radio className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
              <span>Simulate Webhook</span>
            </motion.button>
          </motion.div>

          {/* Fleet Statistics KPI Strip */}
          <motion.div
            variants={{
              hidden: { opacity: 0, y: 20 },
              show: { opacity: 1, y: 0, transition: { duration: 0.6 } },
            }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 pt-8 border-t border-white/[0.08] w-full max-w-4xl text-center"
          >
            <motion.div whileHover={{ y: -4, scale: 1.02 }} className="p-4 sm:p-5 rounded-2xl glass-card-interactive cursor-default">
              <div className="text-3xl sm:text-4xl font-black text-white tracking-tight tabular-nums">6 Repos</div>
              <div className="text-xs text-slate-400 mt-1 font-medium">Fleet Monitored</div>
              <div className="text-[11px] text-emerald-400 font-semibold mt-1">● 100% Active</div>
            </motion.div>

            <motion.div whileHover={{ y: -4, scale: 1.02 }} className="p-4 sm:p-5 rounded-2xl glass-card-interactive cursor-default">
              <div className="text-3xl sm:text-4xl font-black text-emerald-400 tracking-tight tabular-nums">94.2 <span className="text-sm font-normal text-slate-400">/ 100</span></div>
              <div className="text-xs text-slate-400 mt-1 font-medium">Algorithmic Health Score</div>
              <div className="text-[11px] text-emerald-400 font-semibold mt-1">▲ +3.4% This Week</div>
            </motion.div>

            <motion.div whileHover={{ y: -4, scale: 1.02 }} className="p-4 sm:p-5 rounded-2xl glass-card-interactive cursor-default">
              <div className="text-3xl sm:text-4xl font-black text-indigo-400 tracking-tight tabular-nums">2.4h</div>
              <div className="text-xs text-slate-400 mt-1 font-medium">Avg PR Review Latency</div>
              <div className="text-[11px] text-indigo-400 font-semibold mt-1">38% Faster than SLA</div>
            </motion.div>

            <motion.div whileHover={{ y: -4, scale: 1.02 }} className="p-4 sm:p-5 rounded-2xl glass-card-interactive cursor-default">
              <div className="text-3xl sm:text-4xl font-black text-violet-400 tracking-tight tabular-nums">&lt; 45ms</div>
              <div className="text-xs text-slate-400 mt-1 font-medium">Live Telemetry Ingestion</div>
              <div className="text-[11px] text-violet-400 font-semibold mt-1">Zero-Drop Backpressure</div>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Subtle 3D Cockpit Indicator */}
        <div id="cockpit" className="mt-14 mb-8 flex items-center justify-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/80 border border-indigo-500/30 backdrop-blur-md shadow-lg shadow-indigo-500/10 text-xs font-mono text-slate-300">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Interactive 3D Cockpit • Hover cursor to experience 3D spatial depth</span>
          </div>
        </div>

        {/* HERO SHOWCASE: Interactive Live Cockpit Window with 3D Tilt */}
        <Hero3DTiltCard className="max-w-6xl mx-auto">
          <div className="relative rounded-2xl glass-card overflow-hidden shadow-2xl border border-white/15">
            {/* Window Titlebar */}
            <div className="px-5 py-3.5 bg-slate-900/90 border-b border-white/10 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-rose-500/80 hover:bg-rose-500 cursor-pointer" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/80 hover:bg-amber-500 cursor-pointer" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/80 hover:bg-emerald-500 cursor-pointer" />
                </div>
                <div className="h-4 w-px bg-white/10" />
                <span className="text-xs text-slate-400 font-mono flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5 text-indigo-400" />
                  repopulse.dev/mission-control/live-overview
                </span>
              </div>

              {/* View Switcher Tabs Inside Cockpit Header */}
              <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-950/80 border border-white/10">
                <button
                  onClick={() => setActiveCockpitTab('fleet')}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                    activeCockpitTab === 'fleet'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Fleet Overview
                </button>
                <button
                  onClick={() => setActiveCockpitTab('telemetry')}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                    activeCockpitTab === 'telemetry'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Activity className="w-3 h-3 text-emerald-400" />
                  Live Feed
                </button>
                <button
                  onClick={() => setActiveCockpitTab('contributors')}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                    activeCockpitTab === 'contributors'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Top Velocity
                </button>
              </div>

              {/* Telemetry Status Indicator */}
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-live" />
                <span className="text-xs font-mono font-medium text-emerald-400">
                  REAL-TIME TELEMETRY (24ms)
                </span>
              </div>
            </div>

            {/* Window Body: Interactive Simulation Views */}
            <div className="p-6 sm:p-8 space-y-6 bg-slate-950/95">
              {/* Metric Card Strip */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-slate-900/70 border border-white/[0.08] hover:border-indigo-500/40 transition-all">
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                    <span>Fleet Health Index</span>
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="text-3xl font-black text-white tracking-tight tabular-nums">
                    {healthScore}
                    <span className="text-xs font-normal text-slate-400">/100</span>
                  </div>
                  <div className="text-[11px] text-emerald-400 font-medium mt-1">
                    All 6 Repos Above Baseline
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-900/70 border border-white/[0.08] hover:border-indigo-500/40 transition-all">
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                    <span>Mean PR Latency</span>
                    <Clock className="w-4 h-4 text-indigo-400" />
                  </div>
                  <div className="text-3xl font-black text-indigo-400 tracking-tight tabular-nums">2.4h</div>
                  <div className="text-[11px] text-slate-400 font-medium mt-1">
                    38% faster than 4h target
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-900/70 border border-white/[0.08] hover:border-indigo-500/40 transition-all">
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                    <span>Active Commits (7d)</span>
                    <GitCommit className="w-4 h-4 text-violet-400" />
                  </div>
                  <div className="text-3xl font-black text-white tracking-tight tabular-nums">1,284</div>
                  <div className="text-[11px] text-emerald-400 font-medium mt-1">+14% sprint velocity</div>
                </div>

                <div className="p-4 rounded-xl bg-slate-900/70 border border-white/[0.08] hover:border-indigo-500/40 transition-all">
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                    <span>CI Stability Rate</span>
                    <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                  </div>
                  <div className="text-3xl font-black text-cyan-400 tracking-tight tabular-nums">99.2%</div>
                  <div className="text-[11px] text-slate-400 font-medium mt-1">
                    42 runs • 0 critical flakes
                  </div>
                </div>
              </div>

              {/* Dynamic View Content based on Tab */}
              {activeCockpitTab === 'fleet' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                  {/* Left: Live Webhook Activity Stream */}
                  <div className="p-5 rounded-2xl bg-slate-900/60 border border-white/[0.08] space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                        <Activity className="w-4 h-4 text-indigo-400" />
                        Live Webhook Telemetry Stream
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20">
                        STREAMING
                      </span>
                    </div>

                    <div className="space-y-2.5">
                      {liveStreamEvents.map((item) => (
                        <div
                          key={item.id}
                          className="p-3 rounded-xl bg-slate-950/70 border border-white/[0.05] hover:border-white/10 flex items-center justify-between text-xs transition-all"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <img
                              src={item.avatar}
                              alt={item.actor}
                              className="w-7 h-7 rounded-full bg-slate-800 border border-white/10 shrink-0"
                            />
                            <div className="truncate">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-white">{item.actor}</span>
                                <span className="text-[10px] font-mono text-slate-400 px-1.5 py-0.2 rounded bg-slate-900 border border-white/5">
                                  {item.repo}
                                </span>
                              </div>
                              <p className="text-slate-300 truncate mt-0.5">{item.action}</p>
                            </div>
                          </div>
                          <span className="text-[11px] font-mono text-slate-500 shrink-0 ml-3">
                            {item.time}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="pt-2 flex items-center justify-between text-xs border-t border-white/[0.06]">
                      <span className="text-slate-400 text-[11px]">Simulate a test event:</span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleSimulateWebhook('push')}
                          className="px-2.5 py-1 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 text-[11px] font-medium border border-indigo-500/20"
                        >
                          + Commit
                        </button>
                        <button
                          onClick={() => handleSimulateWebhook('pr')}
                          className="px-2.5 py-1 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 text-[11px] font-medium border border-purple-500/20"
                        >
                          + PR
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Right: Fleet Health Quick Matrix */}
                  <div className="p-5 rounded-2xl bg-slate-900/60 border border-white/[0.08] space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                        <Shield className="w-4 h-4 text-emerald-400" />
                        Monitored Fleet Health Matrix
                      </span>
                      <button
                        onClick={handleLaunch}
                        className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1"
                      >
                        Launch All 6 Repos <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="space-y-2.5">
                      {repositories.slice(0, 4).map((repo) => (
                        <div
                          key={repo.id}
                          className="p-3 rounded-xl bg-slate-950/70 border border-white/[0.05] hover:border-indigo-500/30 flex items-center justify-between text-xs transition-all"
                        >
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-white hover:text-indigo-300 cursor-pointer">
                                {repo.name}
                              </span>
                              <span
                                className={`w-2 h-2 rounded-full ${
                                  languageColors[repo.language] || 'bg-slate-400'
                                }`}
                              />
                              <span className="text-[11px] text-slate-400">{repo.language}</span>
                            </div>
                            <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1 font-mono">
                              <span>★ {repo.stars}</span>
                              <span>⑂ {repo.forks}</span>
                              <span>{repo.openIssues} open issues</span>
                            </div>
                          </div>

                          <div className="text-right shrink-0">
                            <span
                              className={`px-2.5 py-1 rounded-full text-xs font-bold font-mono border ${
                                repo.healthScore >= 90
                                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                                  : repo.healthScore >= 75
                                  ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30'
                                  : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                              }`}
                            >
                              {repo.healthScore} / 100
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="pt-2 flex items-center justify-between text-[11px] text-slate-400 border-t border-white/[0.06]">
                      <span>Real-time webhook health updates: <strong>Active</strong></span>
                      <span className="text-emerald-400 font-mono">TLS 1.3 Verified</span>
                    </div>
                  </div>
                </div>
              )}

              {activeCockpitTab === 'telemetry' && (
                <div className="p-5 rounded-2xl bg-slate-900/60 border border-white/[0.08] space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-white">Continuous Telemetry Ingestion</h4>
                      <p className="text-xs text-slate-400 mt-0.5">
                        High-throughput GitHub webhook worker pipeline with signature validation.
                      </p>
                    </div>
                    <button
                      onClick={handleLaunch}
                      className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white shadow-md shadow-indigo-500/20"
                    >
                      Open Full Live Stream →
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="p-4 rounded-xl bg-slate-950/70 border border-white/[0.06]">
                      <span className="text-[11px] text-slate-400 font-mono">WEBSOCKET STATUS</span>
                      <div className="text-xl font-bold text-emerald-400 font-mono mt-1">CONNECTED</div>
                      <p className="text-[11px] text-slate-500 mt-1">Latency: 24ms • 0 dropped frames</p>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-950/70 border border-white/[0.06]">
                      <span className="text-[11px] text-slate-400 font-mono">EVENT PARSING</span>
                      <div className="text-xl font-bold text-indigo-400 font-mono mt-1">12,480 / min</div>
                      <p className="text-[11px] text-slate-500 mt-1">Worker thread pool: 8 active</p>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-950/70 border border-white/[0.06]">
                      <span className="text-[11px] text-slate-400 font-mono">ENCRYPTION & SECURITY</span>
                      <div className="text-xl font-bold text-cyan-400 font-mono mt-1">HMAC-SHA256</div>
                      <p className="text-[11px] text-slate-500 mt-1">Payload integrity verified</p>
                    </div>
                  </div>
                </div>
              )}

              {activeCockpitTab === 'contributors' && (
                <div className="p-5 rounded-2xl bg-slate-900/60 border border-white/[0.08] space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-white">Top Contributor Velocity & Streaks</h4>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Recognizing engineering consistency, PR responsiveness, and commit volume.
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setDemoMode(true)
                        navigate('/contributors')
                      }}
                      className="text-xs text-indigo-400 hover:text-indigo-300 font-medium"
                    >
                      View Leaderboard →
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {contributors.slice(0, 3).map((c) => (
                      <div
                        key={c.id}
                        className="p-3.5 rounded-xl bg-slate-950/70 border border-white/[0.06] flex items-center gap-3"
                      >
                        <img
                          src={c.avatarUrl}
                          alt={c.name}
                          className="w-10 h-10 rounded-full border border-white/10 shrink-0"
                        />
                        <div className="min-w-0">
                          <div className="font-bold text-white text-xs truncate">{c.name}</div>
                          <div className="text-[11px] text-slate-400 font-mono">@{c.login}</div>
                          <div className="flex items-center gap-2 mt-1 text-[11px]">
                            <span className="text-emerald-400 font-mono font-semibold">
                              {c.commits} commits
                            </span>
                            <span className="text-amber-400 flex items-center gap-0.5 font-mono">
                              <Flame className="w-3 h-3" />
                              {c.currentStreak}d streak
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Bottom Cockpit Action Bar */}
              <div className="pt-4 border-t border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <Sparkles className="w-4 h-4 text-indigo-400" />
                  <span>
                    Interactive telemetry with real-time GitHub repositories, alerts, and live charts.
                  </span>
                </div>

                <button
                  onClick={handleLaunch}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-xs font-bold text-white shadow-md shadow-indigo-500/25 flex items-center justify-center gap-2 hover:scale-[1.02] transition-all"
                >
                  <span>Open Interactive Mission Control</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </Hero3DTiltCard>
      </section>

      {/* Bento Grid Architecture: Core Platform Capabilities */}
      <section id="capabilities" className="relative z-10 max-w-7xl mx-auto px-6 py-24 border-t border-white/[0.08]">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs font-semibold uppercase tracking-wider mb-4">
            <Layers className="w-3.5 h-3.5" />
            <span>Architecture & Engine</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
            Six architectural pillars engineered for velocity.
          </h2>
          <p className="text-base text-slate-400 mt-4 leading-relaxed">
            From algorithmic health triage to multi-channel incident alerting, RepoPulse empowers engineering
            leads with actionable clarity.
          </p>
        </div>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Wide 2-Columns - Health Score Engine */}
          <div className="md:col-span-2 p-8 rounded-3xl glass-card relative overflow-hidden group hover:border-indigo-500/40 transition-all">
            <div className="ambient-glow -top-20 -right-20 w-72 h-72 bg-emerald-500/10" />

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20 ring-1 ring-white/20">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Algorithmic Pulse Health Engine (APHE)</h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Composite 0–100 index weighted across 6 vital engineering dimensions.
                  </p>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Score: 94 / 100
              </span>
            </div>

            {/* Score Breakdown Visual Bars */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-6">
              <div className="p-4 rounded-2xl bg-slate-950/70 border border-white/[0.06] space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300 font-medium">Commit Cadence</span>
                  <span className="font-mono text-emerald-400 font-bold">24 / 25</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full w-[96%]" />
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/70 border border-white/[0.06] space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300 font-medium">PR Responsiveness SLA</span>
                  <span className="font-mono text-indigo-400 font-bold">19 / 20</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div className="h-full bg-indigo-500 rounded-full w-[95%]" />
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/70 border border-white/[0.06] space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300 font-medium">CI Stability & Reliability</span>
                  <span className="font-mono text-cyan-400 font-bold">19 / 20</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div className="h-full bg-cyan-500 rounded-full w-[95%]" />
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/70 border border-white/[0.06] space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300 font-medium">Bus Factor & Contributor Spread</span>
                  <span className="font-mono text-purple-400 font-bold">14 / 15</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div className="h-full bg-purple-500 rounded-full w-[93%]" />
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Eliminate subjective code reviews. RepoPulse monitors commit freshness, PR turnaround, issue
              stagnation, and dependency churn to provide a definitive score every engineering standup.
            </p>
          </div>

          {/* Card 2: 1-Column - Sub-Second Webhooks */}
          <div className="p-8 rounded-3xl glass-card relative overflow-hidden group hover:border-indigo-500/40 transition-all flex flex-col justify-between">
            <div className="ambient-glow -bottom-20 -left-20 w-60 h-60 bg-indigo-500/10" />

            <div>
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20 ring-1 ring-white/20 mb-6">
                <Radio className="w-6 h-6 animate-pulse" />
              </div>

              <h3 className="text-xl font-bold text-white mb-2">Sub-Second Webhook Telemetry</h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-6">
                Instantaneous event bus captures pushes, pull requests, issue reactions, and pipeline dispatches in under 50ms.
              </p>

              <div className="p-4 rounded-2xl bg-slate-950/80 border border-white/[0.06] font-mono text-xs space-y-2">
                <div className="flex items-center justify-between text-slate-400">
                  <span>DISPATCH LATENCY</span>
                  <span className="text-emerald-400 font-bold">34ms</span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>SIGNATURE STATUS</span>
                  <span className="text-indigo-400">VERIFIED</span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>QUEUE BACKLOG</span>
                  <span className="text-slate-300">0 events</span>
                </div>
              </div>
            </div>

            <div className="pt-6">
              <button
                onClick={() => handleSimulateWebhook('push')}
                className="w-full py-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-xs font-semibold text-slate-200 border border-white/10 flex items-center justify-center gap-2 transition-all"
              >
                <RefreshCw className="w-3.5 h-3.5 text-indigo-400" />
                <span>Simulate Webhook Ingestion</span>
              </button>
            </div>
          </div>

          {/* Card 3: 1-Column - PR Review Latency */}
          <div className="p-8 rounded-3xl glass-card relative overflow-hidden group hover:border-indigo-500/40 transition-all flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center text-white shadow-lg shadow-rose-500/20 ring-1 ring-white/20 mb-6">
                <GitPullRequest className="w-6 h-6" />
              </div>

              <h3 className="text-xl font-bold text-white mb-2">PR Review Latency Tracker</h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-6">
                Pinpoint code review friction. Identify stalled PRs before sprints miss deadlines and calculate accurate review turnaround SLAs.
              </p>

              <div className="p-4 rounded-2xl bg-slate-950/80 border border-white/[0.06] space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Under 2 Hours</span>
                  <span className="font-mono text-emerald-400 font-bold">64% of PRs</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">2 to 6 Hours</span>
                  <span className="font-mono text-indigo-400 font-bold">28% of PRs</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Stalled (&gt; 24h)</span>
                  <span className="font-mono text-rose-400 font-bold">8% of PRs</span>
                </div>
              </div>
            </div>

            <div className="pt-6">
              <Link
                to="/pull-requests"
                onClick={() => setDemoMode(true)}
                className="w-full py-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-xs font-semibold text-slate-200 border border-white/10 flex items-center justify-center gap-2 transition-all"
              >
                <span>Inspect PR Review Matrix</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Card 4: Wide 2-Columns - Multi-Channel Alert Matrix */}
          <div className="md:col-span-2 p-8 rounded-3xl glass-card relative overflow-hidden group hover:border-indigo-500/40 transition-all">
            <div className="ambient-glow -top-20 -left-20 w-72 h-72 bg-purple-500/10" />

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white shadow-lg shadow-orange-500/20 ring-1 ring-white/20">
                  <Bell className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Multi-Channel Alert Dispatcher</h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Real-time webhooks routing anomalies directly to Slack, Discord, Email, and PagerDuty.
                  </p>
                </div>
              </div>

              {/* Channel Selector Pills */}
              <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-950/80 border border-white/10">
                {['slack', 'discord', 'email', 'webhook'].map((ch) => (
                  <button
                    key={ch}
                    onClick={() => setSelectedAlertChannel(ch)}
                    className={`px-3 py-1 rounded-lg text-xs font-medium uppercase font-mono transition-all ${
                      selectedAlertChannel === ch
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {ch}
                  </button>
                ))}
              </div>
            </div>

            {/* Interactive Alert Simulator Box */}
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-white/[0.08] font-mono text-xs text-slate-300 space-y-2">
              <div className="flex items-center justify-between border-b border-white/5 pb-2 text-[11px] text-slate-500">
                <span>SIMULATED OUTBOUND PAYLOAD • {selectedAlertChannel.toUpperCase()}</span>
                <span className="text-emerald-400 font-bold">STATUS 200 OK</span>
              </div>

              {selectedAlertChannel === 'slack' && (
                <div className="space-y-1 text-slate-300">
                  <div className="text-indigo-400 font-bold">#alerts-mission-control [BOT]</div>
                  <div>🚨 <strong>CRITICAL: CI Regression Detected</strong> on <code>Zectral/agentic-ai-platform</code></div>
                  <div className="text-slate-400">Run #842 failed on step: <code>e2e-distributed-tests</code> (Exit 1)</div>
                </div>
              )}

              {selectedAlertChannel === 'discord' && (
                <div className="space-y-1 text-slate-300">
                  <div className="text-purple-400 font-bold">RepoPulse Bot — #dev-telemetry</div>
                  <div>✨ <strong>Milestone:</strong> <code>Zectral/the-grocery-hub</code> just surpassed <strong>1,200 Stars</strong>!</div>
                  <div className="text-slate-400">Velocity: +18 stars in last 24h • Contributor streak: 12d</div>
                </div>
              )}

              {selectedAlertChannel === 'email' && (
                <div className="space-y-1 text-slate-300">
                  <div className="text-amber-400 font-bold">To: lead-architect@enterprise.dev</div>
                  <div>Subject: [RepoPulse Digest] Weekly Fleet Audit — 94/100 Average Health</div>
                  <div className="text-slate-400">All 6 repositories passed security scans. 142 commits merged.</div>
                </div>
              )}

              {selectedAlertChannel === 'webhook' && (
                <div className="space-y-1 text-slate-300">
                  <div className="text-cyan-400 font-bold">POST https://api.client.internal/hooks/github-audit</div>
                  <div className="text-slate-400">{`{"event":"health_score_change","repo":"repopulse","delta":+3,"score":95}`}</div>
                </div>
              )}
            </div>

            <div className="pt-4 flex items-center justify-between text-xs text-slate-400">
              <span>Supports conditional filters (e.g. Star spikes, CI breaks, Force pushes)</span>
              <Link
                to="/activity"
                onClick={() => setDemoMode(true)}
                className="text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1"
              >
                View Live Telemetry <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Fleet Repositories Interactive Grid */}
      <section id="fleet" className="relative z-10 max-w-7xl mx-auto px-6 py-24 border-t border-white/[0.08]">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold uppercase tracking-wider mb-3">
              <FolderGit2 className="w-3.5 h-3.5" />
              <span>Fleet Telemetry</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Monitored Repositories at a Glance
            </h2>
            <p className="text-sm text-slate-400 mt-2 max-w-xl">
              Inspect health ratings, language footprints, and commit velocity across all 6 connected repositories.
            </p>
          </div>

          <button
            onClick={() => {
              setDemoMode(true)
              navigate('/repositories')
            }}
            className="self-start sm:self-auto px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-semibold text-white border border-white/10 hover:border-white/20 transition-all flex items-center gap-2"
          >
            <span>View All Repositories</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Repository Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {repositories.map((repo) => (
            <div
              key={repo.id}
              className="p-6 rounded-2xl glass-card-interactive flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="min-w-0">
                    <span className="text-[11px] font-mono text-slate-500 uppercase">{repo.owner}</span>
                    <h3 className="text-lg font-bold text-white group-hover:text-indigo-300 transition-colors truncate">
                      {repo.name}
                    </h3>
                  </div>

                  <span
                    className={`px-3 py-1 rounded-full text-xs font-mono font-bold border shrink-0 ${
                      repo.healthScore >= 90
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                        : repo.healthScore >= 75
                        ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30'
                        : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                    }`}
                  >
                    {repo.healthScore} / 100
                  </span>
                </div>

                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-6">
                  {repo.description}
                </p>
              </div>

              <div>
                {/* Meta stats */}
                <div className="flex items-center justify-between text-xs text-slate-400 pt-4 border-t border-white/[0.08] mb-4">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2.5 h-2.5 rounded-full ${
                        languageColors[repo.language] || 'bg-slate-400'
                      }`}
                    />
                    <span className="font-medium text-slate-300">{repo.language}</span>
                  </div>

                  <div className="flex items-center gap-3 font-mono text-[11px]">
                    <span className="flex items-center gap-1">
                      <Star className="w-3 h-3 text-amber-400" />
                      {repo.stars}
                    </span>
                    <span className="flex items-center gap-1">
                      <GitFork className="w-3 h-3 text-slate-400" />
                      {repo.forks}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setDemoMode(true)
                    navigate(`/repositories/${repo.owner}/${repo.name}`)
                  }}
                  className="w-full py-2.5 rounded-xl bg-slate-900/90 hover:bg-indigo-600 text-xs font-semibold text-slate-300 hover:text-white border border-white/10 hover:border-transparent transition-all flex items-center justify-center gap-2"
                >
                  <span>Launch Repository Telemetry</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Interactive Webhook Simulator & Integration Section */}
      <section id="telemetry-test" className="relative z-10 max-w-7xl mx-auto px-6 py-24 border-t border-white/[0.08]">
        <div className="rounded-3xl p-8 sm:p-12 glass-card border border-indigo-500/30 relative overflow-hidden">
          <div className="ambient-glow -top-32 right-10 w-96 h-96 bg-indigo-500/20" />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs font-semibold uppercase tracking-wider mb-4">
                <Terminal className="w-3.5 h-3.5" />
                <span>Developer Experience</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                Try the Live Webhook Simulation
              </h2>
              <p className="text-sm text-slate-300 mt-3 leading-relaxed">
                RepoPulse connects seamlessly to GitHub Webhook events. Test sending simulated payloads right
                now and observe how the mission control cockpit instantly calculates new telemetry.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  onClick={() => handleSimulateWebhook('push')}
                  className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white shadow-lg shadow-indigo-500/25 flex items-center gap-2 transition-all"
                >
                  <Radio className="w-3.5 h-3.5" />
                  <span>Simulate Git Push (38ms)</span>
                </button>

                <button
                  onClick={() => handleSimulateWebhook('pr')}
                  className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-xs font-bold text-white shadow-lg shadow-purple-500/25 flex items-center gap-2 transition-all"
                >
                  <GitPullRequest className="w-3.5 h-3.5" />
                  <span>Simulate PR Open (SLA Tracker)</span>
                </button>

                <button
                  onClick={() => handleSimulateWebhook('alert')}
                  className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-xs font-bold text-white shadow-lg shadow-amber-500/25 flex items-center gap-2 transition-all"
                >
                  <Bell className="w-3.5 h-3.5" />
                  <span>Simulate CI Alert</span>
                </button>
              </div>
            </div>

            {/* Simulated cURL Terminal Box */}
            <div className="rounded-2xl bg-slate-950/90 border border-white/10 p-5 shadow-2xl">
              <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-500/70" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/70" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/70" />
                  <span className="text-xs font-mono text-slate-400 ml-2">bash ~ curl-test</span>
                </div>
                <button
                  onClick={copyWebhookCurl}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 text-[11px] font-mono text-slate-300 border border-white/10 transition-all"
                >
                  {copiedCurl ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span className="text-emerald-400">Copied</span>
                    </>
                  ) : (
                    <>
                      <Terminal className="w-3 h-3" />
                      <span>Copy cURL</span>
                    </>
                  )}
                </button>
              </div>

              <pre className="font-mono text-xs text-slate-300 leading-relaxed overflow-x-auto p-2">
                <span className="text-pink-400">curl</span> -X POST https://api.repopulse.dev/v1/telemetry \<br />
                {'  '}-H <span className="text-emerald-300">"Authorization: Bearer rp_live_test_779"</span> \<br />
                {'  '}-d <span className="text-amber-300">'&#123;"event": "push", "repository": "Zectral/repopulse"&#125;'</span>
              </pre>

              <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-[11px] font-mono text-slate-500">
                <span>Webhook payload signature: verified</span>
                <span className="text-emerald-400">Response: 200 OK (38ms)</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Frequently Asked Questions Accordion */}
      <section id="faq" className="relative z-10 max-w-4xl mx-auto px-6 py-24 border-t border-white/[0.08]">
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-sm text-slate-400 mt-2">
            Everything you need to know about RepoPulse architecture, data collection, and HackQubit demo evaluation.
          </p>
        </div>

        <div className="space-y-4">
          {[
            {
              q: 'How does RepoPulse calculate the Algorithmic Pulse Health Score (0–100)?',
              a: 'The Health Score uses a weighted multi-factor regression model factoring in: Commit cadence & freshness (25%), PR review responsiveness SLA (20%), CI pipeline pass rate & stability (20%), Bus Factor & contributor spread (15%), Community issue triage velocity (10%), and Security alert clean status (10%).',
            },
            {
              q: 'Do I need GitHub write permissions to use RepoPulse?',
              a: 'No. RepoPulse operates entirely on read-only GitHub permissions and public webhook notifications. Your source code is never cloned or stored on external servers.',
            },
            {
              q: 'How does the Hackathon Demo Mode work?',
              a: 'Demo Mode preloads an enterprise-grade dataset featuring 6 active repositories, 10 active contributors with real avatars and streak data, PR review latency metrics, and simulated webhook streaming so you can test all features immediately without configuring credentials.',
            },
            {
              q: 'Can RepoPulse monitor private GitHub organizations?',
              a: 'Yes. In the Settings tab, you can input a personal access token (PAT) or GitHub App installation credentials to monitor private enterprise repositories securely.',
            },
            {
              q: 'What alerting channels are supported?',
              a: 'RepoPulse features a rule-based alerting engine with direct integration for Discord Webhooks, Slack Incoming Webhooks, Custom REST Webhooks, and Email notifications.',
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className="rounded-2xl glass-card border border-white/[0.08] overflow-hidden transition-all"
            >
              <button
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full p-5 text-left flex items-center justify-between gap-4 hover:bg-white/[0.02]"
              >
                <span className="font-bold text-sm sm:text-base text-slate-100">{item.q}</span>
                <ChevronDown
                  className={`w-4 h-4 text-slate-400 transition-transform shrink-0 ${
                    openFaq === idx ? 'rotate-180 text-indigo-400' : ''
                  }`}
                />
              </button>
              {openFaq === idx && (
                <div className="px-5 pb-5 text-xs sm:text-sm text-slate-300 leading-relaxed border-t border-white/[0.04] pt-3">
                  {item.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Massive Call to Action Banner */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 py-20">
        <div className="relative rounded-3xl p-10 sm:p-16 glass-card overflow-hidden text-center border border-indigo-500/30">
          <div className="ambient-glow top-0 left-1/2 -translate-x-1/2 w-[500px] h-52 bg-indigo-500/25" />

          <div className="relative z-10 space-y-5 max-w-2xl mx-auto">
            <span className="px-3 py-1 rounded-full text-xs font-semibold font-mono bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              ⚡ LIVE MISSION CONTROL DEMO READY
            </span>

            <h3 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
              Ready to experience RepoPulse in action?
            </h3>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-lg mx-auto">
              Explore the full simulated hackathon fleet cockpit or connect your own repository credentials to
              unlock real-time engineering telemetry.
            </p>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={handleLaunch}
                className="w-full sm:w-auto px-8 py-4 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 shadow-xl shadow-indigo-500/30 transition-all hover:scale-[1.03] active:scale-[0.98] btn-glow"
              >
                Launch Cockpit Mission Control
              </button>

              <a
                href="https://github.com/Zectral/repopulse"
                target="_blank"
                rel="noreferrer"
                className="w-full sm:w-auto px-7 py-4 rounded-xl font-semibold text-sm text-slate-200 bg-slate-900/80 hover:bg-slate-800 border border-white/10 hover:border-white/20 transition-all"
              >
                View on GitHub
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* High-End Footer */}
      <footer className="relative z-10 border-t border-white/[0.08] py-12 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-6 space-y-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
                <Zap className="w-4 h-4" />
              </div>
              <span className="font-bold text-sm text-slate-200">RepoPulse</span>
              <span className="text-slate-500">— Built for HackQubit 2026</span>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-6 text-slate-400">
              <button onClick={handleLaunch} className="hover:text-white transition-colors">
                Cockpit
              </button>
              <Link to="/repositories" onClick={() => setDemoMode(true)} className="hover:text-white transition-colors">
                Repositories
              </Link>
              <Link to="/pull-requests" onClick={() => setDemoMode(true)} className="hover:text-white transition-colors">
                Pull Requests
              </Link>
              <Link to="/analytics" onClick={() => setDemoMode(true)} className="hover:text-white transition-colors">
                Analytics
              </Link>
              <Link to="/contributors" onClick={() => setDemoMode(true)} className="hover:text-white transition-colors">
                Contributors
              </Link>
              <Link to="/reports" onClick={() => setDemoMode(true)} className="hover:text-white transition-colors">
                Reports
              </Link>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-6 border-t border-white/[0.06] text-[11px] text-slate-600">
            <div>© 2026 RepoPulse. All rights reserved. HackQubit Autonomous Innovation Track.</div>
            <div className="flex items-center gap-3">
              <span>Telemetry Engine v2.4</span>
              <span>•</span>
              <span className="text-emerald-500">All Systems Operational</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
