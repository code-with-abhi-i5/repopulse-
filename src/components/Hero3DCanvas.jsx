import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { Sparkles, Radio, Shield, Zap, GitPullRequest, Activity } from 'lucide-react'

export default function Hero3DCanvas({ onTriggerPulse }) {
  const containerRef = useRef(null)
  const [activeNode, setActiveNode] = useState(null)
  const [isHovered, setIsHovered] = useState(false)
  const [pulseCount, setPulseCount] = useState(0)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    // Scene, Camera, Renderer
    const scene = new THREE.Scene()
    const width = container.clientWidth || 600
    const height = container.clientHeight || 500

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000)
    camera.position.z = 10

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    })
    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.2
    container.appendChild(renderer.domElement)

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7)
    scene.add(ambientLight)

    const pointLight1 = new THREE.PointLight(0x6366f1, 3.5, 30)
    pointLight1.position.set(5, 5, 5)
    scene.add(pointLight1)

    const pointLight2 = new THREE.PointLight(0x06b6d4, 3, 30)
    pointLight2.position.set(-5, -3, 3)
    scene.add(pointLight2)

    const pointLight3 = new THREE.PointLight(0xa855f7, 2.5, 30)
    pointLight3.position.set(0, 6, -4)
    scene.add(pointLight3)

    // 1. Central Core Group
    const coreGroup = new THREE.Group()
    scene.add(coreGroup)

    // Wireframe Icosahedron (Cyber Core)
    const icoGeo = new THREE.IcosahedronGeometry(2.0, 2)
    const icoMat = new THREE.MeshStandardMaterial({
      color: 0x4f46e5,
      wireframe: true,
      transparent: true,
      opacity: 0.35,
      roughness: 0.2,
      metalness: 0.8,
      emissive: 0x312e81,
      emissiveIntensity: 0.6,
    })
    const icoMesh = new THREE.Mesh(icoGeo, icoMat)
    coreGroup.add(icoMesh)

    // Inner Glowing Core Sphere
    const innerGeo = new THREE.SphereGeometry(1.25, 32, 32)
    const innerMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      roughness: 0.1,
      metalness: 0.9,
      transparent: true,
      opacity: 0.25,
      emissive: 0x0284c7,
      emissiveIntensity: 0.8,
    })
    const innerMesh = new THREE.Mesh(innerGeo, innerMat)
    coreGroup.add(innerMesh)

    // High-tech Dense Dot Matrix inside the core
    const corePointsCount = 180
    const corePointsGeo = new THREE.BufferGeometry()
    const corePositions = new Float32Array(corePointsCount * 3)
    const coreColors = new Float32Array(corePointsCount * 3)

    for (let i = 0; i < corePointsCount; i++) {
      const u = Math.random()
      const v = Math.random()
      const theta = u * 2.0 * Math.PI
      const phi = Math.acos(2.0 * v - 1.0)
      const r = 1.35 + Math.random() * 0.5

      const x = r * Math.sin(phi) * Math.cos(theta)
      const y = r * Math.sin(phi) * Math.sin(theta)
      const z = r * Math.cos(phi)

      corePositions[i * 3] = x
      corePositions[i * 3 + 1] = y
      corePositions[i * 3 + 2] = z

      // Gradient color (Cyan to Indigo to Violet)
      if (i % 3 === 0) {
        coreColors[i * 3] = 0.22 // R (cyan)
        coreColors[i * 3 + 1] = 0.74 // G
        coreColors[i * 3 + 2] = 0.97 // B
      } else if (i % 3 === 1) {
        coreColors[i * 3] = 0.39 // R (indigo)
        coreColors[i * 3 + 1] = 0.40 // G
        coreColors[i * 3 + 2] = 0.95 // B
      } else {
        coreColors[i * 3] = 0.66 // R (violet)
        coreColors[i * 3 + 1] = 0.33 // G
        coreColors[i * 3 + 2] = 0.97 // B
      }
    }

    corePointsGeo.setAttribute('position', new THREE.BufferAttribute(corePositions, 3))
    corePointsGeo.setAttribute('color', new THREE.BufferAttribute(coreColors, 3))

    const corePointsMat = new THREE.PointsMaterial({
      size: 0.08,
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
    })
    const corePoints = new THREE.Points(corePointsGeo, corePointsMat)
    coreGroup.add(corePoints)

    // 2. Cyber Orbital Rings
    const ringGroup = new THREE.Group()
    scene.add(ringGroup)

    const createTechRing = (radius, tube, rotX, rotY, color) => {
      const ringGeo = new THREE.TorusGeometry(radius, tube, 16, 120)
      const ringMat = new THREE.MeshStandardMaterial({
        color: color,
        emissive: color,
        emissiveIntensity: 0.8,
        transparent: true,
        opacity: 0.65,
        roughness: 0.3,
        metalness: 0.9,
      })
      const ring = new THREE.Mesh(ringGeo, ringMat)
      ring.rotation.x = rotX
      ring.rotation.y = rotY
      return ring
    }

    const ring1 = createTechRing(2.9, 0.02, Math.PI / 3, 0, 0x6366f1)
    const ring2 = createTechRing(3.6, 0.025, -Math.PI / 4, Math.PI / 6, 0x06b6d4)
    const ring3 = createTechRing(4.2, 0.02, Math.PI / 2.2, -Math.PI / 5, 0xa855f7)

    ringGroup.add(ring1)
    ringGroup.add(ring2)
    ringGroup.add(ring3)

    // 3. Orbiting Telemetry Satellites (Repo Clusters)
    const satelliteNodes = [
      { name: 'repopulse (core)', color: 0x10b981, dist: 3.6, speed: 0.8, phase: 0 },
      { name: 'the-grocery-hub', color: 0x6366f1, dist: 4.2, speed: -0.6, phase: 1.5 },
      { name: 'agentic-ai-platform', color: 0x06b6d4, dist: 2.9, speed: 1.1, phase: 3.1 },
      { name: 'quantum-sec-gate', color: 0xa855f7, dist: 3.8, speed: -0.9, phase: 4.2 },
      { name: 'telemetry-ws-stream', color: 0xf59e0b, dist: 3.2, speed: 0.7, phase: 2.3 },
    ]

    const satelliteMeshes = satelliteNodes.map((sat) => {
      const satGeo = new THREE.SphereGeometry(0.14, 16, 16)
      const satMat = new THREE.MeshStandardMaterial({
        color: sat.color,
        emissive: sat.color,
        emissiveIntensity: 1.5,
      })
      const mesh = new THREE.Mesh(satGeo, satMat)

      // Light halo around satellite
      const glowGeo = new THREE.SphereGeometry(0.24, 16, 16)
      const glowMat = new THREE.MeshBasicMaterial({
        color: sat.color,
        transparent: true,
        opacity: 0.35,
        blending: THREE.AdditiveBlending,
      })
      const glow = new THREE.Mesh(glowGeo, glowMat)
      mesh.add(glow)

      scene.add(mesh)
      return { mesh, ...sat }
    })

    // 4. Expanding Telemetry Pulse Shockwaves
    const pulses = []
    const emitPulse = () => {
      const pGeo = new THREE.RingGeometry(0.5, 0.58, 64)
      const pMat = new THREE.MeshBasicMaterial({
        color: 0x38bdf8,
        transparent: true,
        opacity: 0.9,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending,
      })
      const pMesh = new THREE.Mesh(pGeo, pMat)
      pMesh.rotation.x = Math.PI / 2
      scene.add(pMesh)
      pulses.push({ mesh: pMesh, scale: 0.5, opacity: 0.9 })
      setPulseCount((c) => c + 1)
    }

    // Auto-emit pulse every 3.5 seconds
    const pulseInterval = setInterval(emitPulse, 3500)

    // 5. Interactive Mouse Rotation & Parallax
    let mouseX = 0
    let mouseY = 0
    let targetX = 0
    let targetY = 0

    const handleMouseMove = (e) => {
      const rect = container.getBoundingClientRect()
      const x = (e.clientX - rect.left) / rect.width - 0.5
      const y = (e.clientY - rect.top) / rect.height - 0.5
      targetX = x * 1.5
      targetY = y * 1.5
    }

    const handleMouseEnter = () => setIsHovered(true)
    const handleMouseLeave = () => {
      setIsHovered(false)
      targetX = 0
      targetY = 0
    }

    const handleClick = () => {
      emitPulse()
      if (onTriggerPulse) onTriggerPulse()
    }

    container.addEventListener('mousemove', handleMouseMove)
    container.addEventListener('mouseenter', handleMouseEnter)
    container.addEventListener('mouseleave', handleMouseLeave)
    container.addEventListener('click', handleClick)

    // 6. Animation Loop
    let animationFrameId
    let clock = new THREE.Clock()

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate)
      const elapsedTime = clock.getElapsedTime()

      // Smooth inertia on mouse tilt
      mouseX += (targetX - mouseX) * 0.05
      mouseY += (targetY - mouseY) * 0.05

      // Core rotation
      const speedMultiplier = isHovered ? 1.6 : 1.0
      coreGroup.rotation.y = elapsedTime * 0.25 * speedMultiplier + mouseX * 0.8
      coreGroup.rotation.x = Math.sin(elapsedTime * 0.2) * 0.15 - mouseY * 0.8

      // Pulsing scale on inner core
      const pulseWave = 1 + Math.sin(elapsedTime * 3) * 0.04
      innerMesh.scale.set(pulseWave, pulseWave, pulseWave)

      // Ring rotations
      ring1.rotation.z = elapsedTime * 0.3 * speedMultiplier
      ring2.rotation.z = -elapsedTime * 0.25 * speedMultiplier
      ring3.rotation.z = elapsedTime * 0.18 * speedMultiplier

      ringGroup.rotation.y = mouseX * 0.4
      ringGroup.rotation.x = -mouseY * 0.4

      // Orbiting satellites positioning
      satelliteMeshes.forEach((sat) => {
        const angle = elapsedTime * sat.speed * 0.4 * speedMultiplier + sat.phase
        sat.mesh.position.x = Math.cos(angle) * sat.dist
        sat.mesh.position.z = Math.sin(angle) * sat.dist
        sat.mesh.position.y = Math.sin(angle * 2) * 0.6
      })

      // Expanding Shockwaves
      for (let i = pulses.length - 1; i >= 0; i--) {
        const p = pulses[i]
        p.scale += 0.08
        p.opacity -= 0.015
        p.mesh.scale.set(p.scale, p.scale, 1)
        p.mesh.material.opacity = p.opacity

        if (p.opacity <= 0) {
          scene.remove(p.mesh)
          p.mesh.geometry.dispose()
          p.mesh.material.dispose()
          pulses.splice(i, 1)
        }
      }

      renderer.render(scene, camera)
    }

    animate()

    // 7. Responsive Resize Observer
    const handleResize = () => {
      if (!container) return
      const newWidth = container.clientWidth
      const newHeight = container.clientHeight
      camera.aspect = newWidth / newHeight
      camera.updateProjectionMatrix()
      renderer.setSize(newWidth, newHeight)
    }

    window.addEventListener('resize', handleResize)

    // Cleanup
    return () => {
      clearInterval(pulseInterval)
      cancelAnimationFrame(animationFrameId)
      window.removeEventListener('resize', handleResize)
      container.removeEventListener('mousemove', handleMouseMove)
      container.removeEventListener('mouseenter', handleMouseEnter)
      container.removeEventListener('mouseleave', handleMouseLeave)
      container.removeEventListener('click', handleClick)

      pulses.forEach((p) => {
        scene.remove(p.mesh)
        p.mesh.geometry.dispose()
        p.mesh.material.dispose()
      })

      icoGeo.dispose()
      icoMat.dispose()
      innerGeo.dispose()
      innerMat.dispose()
      corePointsGeo.dispose()
      corePointsMat.dispose()

      satelliteMeshes.forEach((sat) => {
        sat.mesh.geometry.dispose()
        sat.mesh.material.dispose()
      })

      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement)
      }
      renderer.dispose()
    }
  }, [onTriggerPulse])

  return (
    <div className="relative w-full h-[420px] sm:h-[480px] lg:h-[540px] flex items-center justify-center">
      {/* Three.js Canvas Container */}
      <div
        ref={containerRef}
        className="w-full h-full cursor-grab active:cursor-grabbing select-none"
        style={{ touchAction: 'none' }}
      />

      {/* Floating Hologram HUD Overlays */}
      <div className="absolute top-4 left-4 z-10 pointer-events-none">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950/70 border border-indigo-500/30 backdrop-blur-md shadow-lg shadow-indigo-500/10">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-live" />
          <span className="text-[11px] font-mono font-semibold text-white tracking-wider">
            3D TELEMETRY CORE
          </span>
          <span className="text-[10px] font-mono text-indigo-400 border-l border-white/10 pl-2">
            24ms
          </span>
        </div>
      </div>

      <div className="absolute top-4 right-4 z-10 pointer-events-none">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950/70 border border-cyan-500/30 backdrop-blur-md shadow-lg shadow-cyan-500/10">
          <Zap className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
          <span className="text-[11px] font-mono text-cyan-300 font-medium">
            Click to Pulse Core
          </span>
        </div>
      </div>

      {/* Dynamic Floating Nodes Quick Stats */}
      <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-xs pointer-events-none">
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-white/10 backdrop-blur-md font-mono text-[11px] text-slate-300">
          <Activity className="w-3.5 h-3.5 text-emerald-400" />
          <span>6 Active Clusters Synced</span>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-white/10 backdrop-blur-md font-mono text-[11px] text-slate-300 ml-auto">
          <Radio className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
          <span>WebGL 3D GPU Engine</span>
        </div>
      </div>
    </div>
  )
}
