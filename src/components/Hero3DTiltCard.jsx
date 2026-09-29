import { useRef, useState } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { Activity, ShieldCheck, Zap, GitPullRequest, Radio, ArrowUpRight, CheckCircle2 } from 'lucide-react'

export default function Hero3DTiltCard({ children, className = '' }) {
  const cardRef = useRef(null)
  const [isHovered, setIsHovered] = useState(false)

  // Motion values for smooth 3D tilt
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  // Spring physics for natural damping and zero jitter
  const springConfig = { damping: 25, stiffness: 180, mass: 0.6 }
  const smoothMouseX = useSpring(mouseX, springConfig)
  const smoothMouseY = useSpring(mouseY, springConfig)

  // Map mouse positions to 3D rotation angles (-8 deg to +8 deg)
  const rotateX = useTransform(smoothMouseY, [-0.5, 0.5], [7, -7])
  const rotateY = useTransform(smoothMouseX, [-0.5, 0.5], [-9, 9])

  // Specular light reflection coordinates (percentage)
  const glareX = useTransform(smoothMouseX, [-0.5, 0.5], ['0%', '100%'])
  const glareY = useTransform(smoothMouseY, [-0.5, 0.5], ['0%', '100%'])

  const handleMouseMove = (e) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width - 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5
    mouseX.set(x)
    mouseY.set(y)
  }

  const handleMouseEnter = () => {
    setIsHovered(true)
  }

  const handleMouseLeave = () => {
    setIsHovered(false)
    mouseX.set(0)
    mouseY.set(0)
  }

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`relative perspective-1200 w-full ${className}`}
      style={{ perspective: 1200 }}
    >
      {/* 3D Tilting Container */}
      <motion.div
        style={{
          rotateX,
          rotateY,
          transformStyle: 'preserve-3d',
        }}
        className="relative w-full rounded-2xl transition-shadow duration-500 will-change-transform"
      >
        {/* Dynamic Specular Sheen / Spotlight following cursor */}
        <motion.div
          className="absolute inset-0 rounded-2xl pointer-events-none z-30 transition-opacity duration-300"
          style={{
            opacity: isHovered ? 0.35 : 0,
            background: useTransform(
              [glareX, glareY],
              ([gx, gy]) =>
                `radial-gradient(circle 450px at ${gx} ${gy}, rgba(255, 255, 255, 0.22), transparent 80%)`
            ),
          }}
        />

        {/* Ambient Neon Backlight Aura */}
        <div className="absolute -inset-2 bg-gradient-to-r from-indigo-500/30 via-violet-500/25 to-cyan-500/30 rounded-3xl blur-2xl opacity-60 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none -z-10" />

        {/* The Actual Content (Cockpit Window) */}
        <div style={{ transform: 'translateZ(0px)' }} className="relative z-10">
          {children}
        </div>

        {/* Floating 3D Badge #1: Top-Left Floating Metric */}
        <motion.div
          style={{
            transform: 'translateZ(48px)',
            transformStyle: 'preserve-3d',
          }}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="hidden lg:flex absolute -top-8 -left-6 z-40 items-center gap-3 p-3 rounded-2xl bg-slate-900/90 border border-indigo-500/40 shadow-2xl shadow-indigo-500/20 backdrop-blur-xl pointer-events-none hover:border-indigo-400 transition-colors"
        >
          <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30 shrink-0">
            <Activity className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-live" />
              <span className="text-[11px] font-mono font-bold text-white uppercase tracking-wider">
                Telemetry 24ms
              </span>
            </div>
            <p className="text-[11px] text-slate-300 font-medium">Zero-Drop Backpressure</p>
          </div>
        </motion.div>

        {/* Floating 3D Badge #2: Top-Right Floating Metric */}
        <motion.div
          style={{
            transform: 'translateZ(55px)',
            transformStyle: 'preserve-3d',
          }}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="hidden lg:flex absolute -top-8 -right-6 z-40 items-center gap-3 p-3 rounded-2xl bg-slate-900/90 border border-emerald-500/40 shadow-2xl shadow-emerald-500/20 backdrop-blur-xl pointer-events-none hover:border-emerald-400 transition-colors"
        >
          <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30 shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-mono font-bold text-emerald-400 uppercase tracking-wider">
                94.2 Health Score
              </span>
            </div>
            <p className="text-[11px] text-slate-300 font-medium">6 Repos Monitored Nominal</p>
          </div>
        </motion.div>

        {/* Floating 3D Badge #3: Bottom-Left Floating Metric */}
        <motion.div
          style={{
            transform: 'translateZ(42px)',
            transformStyle: 'preserve-3d',
          }}
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="hidden md:flex absolute -bottom-7 -left-4 z-40 items-center gap-3 px-4 py-2.5 rounded-2xl bg-slate-900/95 border border-purple-500/40 shadow-2xl shadow-purple-500/20 backdrop-blur-xl pointer-events-none"
        >
          <div className="w-7 h-7 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center border border-purple-500/30">
            <GitPullRequest className="w-4 h-4" />
          </div>
          <div className="text-left font-mono">
            <span className="text-[10px] text-purple-300 font-bold block">PR REVIEW LATENCY</span>
            <span className="text-xs text-white font-bold">2.4 Hours (38% Faster)</span>
          </div>
        </motion.div>

        {/* Floating 3D Badge #4: Bottom-Right Floating Metric */}
        <motion.div
          style={{
            transform: 'translateZ(45px)',
            transformStyle: 'preserve-3d',
          }}
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="hidden md:flex absolute -bottom-7 -right-4 z-40 items-center gap-3 px-4 py-2.5 rounded-2xl bg-slate-900/95 border border-cyan-500/40 shadow-2xl shadow-cyan-500/20 backdrop-blur-xl pointer-events-none"
        >
          <div className="w-7 h-7 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/30">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div className="text-left font-mono">
            <span className="text-[10px] text-cyan-300 font-bold block">CI PIPELINE STABILITY</span>
            <span className="text-xs text-white font-bold">99.2% Zero Critical Flakes</span>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}
