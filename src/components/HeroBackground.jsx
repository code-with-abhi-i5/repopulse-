import { motion } from 'framer-motion'

export default function HeroBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 select-none">
      {/* 1. Top Radiant Aurora Flare (Linear / Vercel style glow spotlight) */}
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[1400px] h-[750px] pointer-events-none">
        <div
          className="w-full h-full"
          style={{
            background:
              'radial-gradient(ellipse 80% 55% at 50% 0%, rgba(99, 102, 241, 0.5) 0%, rgba(139, 92, 246, 0.3) 35%, rgba(6, 182, 212, 0.18) 60%, transparent 85%)',
            filter: 'blur(80px)',
          }}
        />
      </div>

      {/* 2. Floating Animated Ambient Nebula Orbs */}
      <motion.div
        animate={{
          x: [0, 40, -30, 0],
          y: [0, -30, 25, 0],
          scale: [1, 1.2, 0.9, 1],
        }}
        transition={{
          repeat: Infinity,
          duration: 14,
          ease: 'easeInOut',
        }}
        className="absolute top-20 left-[15%] w-[600px] h-[600px] rounded-full bg-indigo-600/25 blur-[120px]"
      />

      <motion.div
        animate={{
          x: [0, -45, 30, 0],
          y: [0, 35, -20, 0],
          scale: [1, 0.85, 1.15, 1],
        }}
        transition={{
          repeat: Infinity,
          duration: 18,
          ease: 'easeInOut',
        }}
        className="absolute top-32 right-[15%] w-[650px] h-[650px] rounded-full bg-cyan-500/20 blur-[130px]"
      />

      <motion.div
        animate={{
          scale: [1, 1.25, 1],
          opacity: [0.35, 0.65, 0.35],
        }}
        transition={{
          repeat: Infinity,
          duration: 9,
          ease: 'easeInOut',
        }}
        className="absolute top-[480px] left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full bg-purple-600/20 blur-[110px]"
      />

      {/* 3. Engineered Architectural Guide Lines with Data Pulses */}
      <div className="absolute inset-0 max-w-7xl mx-auto px-6 h-full flex justify-between opacity-40">
        <div className="w-px h-full bg-gradient-to-b from-transparent via-white/10 to-transparent relative">
          <motion.div
            animate={{ y: ['-10%', '110%'] }}
            transition={{ repeat: Infinity, duration: 6, ease: 'linear' }}
            className="absolute left-1/2 -translate-x-1/2 w-[3px] h-32 bg-gradient-to-b from-transparent via-indigo-400 to-transparent shadow-[0_0_12px_rgba(99,102,241,0.8)]"
          />
        </div>
        <div className="hidden md:block w-px h-full bg-gradient-to-b from-transparent via-white/10 to-transparent relative">
          <motion.div
            animate={{ y: ['-10%', '110%'] }}
            transition={{ repeat: Infinity, duration: 8, delay: 2.5, ease: 'linear' }}
            className="absolute left-1/2 -translate-x-1/2 w-[3px] h-40 bg-gradient-to-b from-transparent via-cyan-400 to-transparent shadow-[0_0_12px_rgba(6,182,212,0.8)]"
          />
        </div>
        <div className="w-px h-full bg-gradient-to-b from-transparent via-white/10 to-transparent relative">
          <motion.div
            animate={{ y: ['-10%', '110%'] }}
            transition={{ repeat: Infinity, duration: 7, delay: 4, ease: 'linear' }}
            className="absolute left-1/2 -translate-x-1/2 w-[3px] h-36 bg-gradient-to-b from-transparent via-purple-400 to-transparent shadow-[0_0_12px_rgba(168,85,247,0.8)]"
          />
        </div>
      </div>

      {/* 4. High-Precision Tech Dot Grid */}
      <div
        className="absolute inset-0 opacity-55"
        style={{
          backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.18) 1.2px, transparent 1.2px)',
          backgroundSize: '28px 28px',
          maskImage: 'radial-gradient(ellipse 80% 65% at 50% 25%, black 25%, transparent 85%)',
          WebkitMaskImage: 'radial-gradient(ellipse 80% 65% at 50% 25%, black 25%, transparent 85%)',
        }}
      />

      {/* 5. 3D Perspective Cyber Floor (Horizontal grid receding into 3D horizon) */}
      <div
        className="absolute top-[320px] left-0 right-0 h-[750px] opacity-45 overflow-hidden"
        style={{ perspective: '500px' }}
      >
        <div
          className="w-[200%] -left-[50%] h-[1400px] absolute"
          style={{
            transform: 'rotateX(74deg) translateY(-25%)',
            backgroundImage:
              'linear-gradient(to right, rgba(99, 102, 241, 0.3) 1px, transparent 1px), linear-gradient(to bottom, rgba(99, 102, 241, 0.3) 1px, transparent 1px)',
            backgroundSize: '52px 52px',
            maskImage: 'linear-gradient(to bottom, transparent, black 10%, black 60%, transparent)',
            WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 10%, black 60%, transparent)',
          }}
        />
        {/* Luminous Neon Horizon Line */}
        <div className="absolute top-[55px] left-1/6 right-1/6 h-[2px] bg-gradient-to-r from-transparent via-indigo-400 to-transparent blur-[1px] shadow-[0_0_16px_rgba(99,102,241,0.9)]" />
      </div>

      {/* 6. Dynamic Floating Stardust Particles */}
      <div className="absolute inset-0">
        {[
          { top: '14%', left: '16%', size: 2.5, delay: 0 },
          { top: '20%', left: '82%', size: 3, delay: 1.2 },
          { top: '28%', left: '74%', size: 2, delay: 2.8 },
          { top: '38%', left: '10%', size: 2.5, delay: 1.8 },
          { top: '16%', left: '50%', size: 3, delay: 3.5 },
          { top: '48%', left: '26%', size: 2, delay: 0.8 },
          { top: '62%', left: '88%', size: 2.5, delay: 2.2 },
        ].map((star, idx) => (
          <motion.div
            key={idx}
            animate={{
              opacity: [0.2, 1, 0.2],
              scale: [0.7, 1.4, 0.7],
            }}
            transition={{
              repeat: Infinity,
              duration: 3 + idx * 0.8,
              delay: star.delay,
              ease: 'easeInOut',
            }}
            style={{
              top: star.top,
              left: star.left,
              width: star.size,
              height: star.size,
            }}
            className="absolute rounded-full bg-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.9)]"
          />
        ))}
      </div>

      {/* 7. Subtle Ambient Scan Wave */}
      <motion.div
        animate={{ y: ['-10%', '120%'] }}
        transition={{ repeat: Infinity, duration: 12, ease: 'linear' }}
        className="absolute top-0 left-0 right-0 h-48 bg-gradient-to-b from-transparent via-indigo-500/[0.04] to-transparent pointer-events-none"
      />
    </div>
  )
}
