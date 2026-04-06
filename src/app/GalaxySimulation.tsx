'use client'

import { useEffect, useRef } from 'react'

interface Star {
  angle: number
  radius: number
  armOffset: number
  z: number
  size: number
  brightness: number
  color: [number, number, number]
  speed: number
}

const NUM_STARS = 8000
const NUM_ARMS = 4
const ARM_SPREAD = 0.6
const ROTATION_SPEED = 0.00008
const CORE_RADIUS = 0.08
const GALAXY_RADIUS = 0.42

function createStars(): Star[] {
  const stars: Star[] = []

  for (let i = 0; i < NUM_STARS; i++) {
    const isCore = Math.random() < 0.15
    const arm = Math.floor(Math.random() * NUM_ARMS)
    const armAngle = (arm / NUM_ARMS) * Math.PI * 2

    let radius: number
    if (isCore) {
      radius = Math.random() * CORE_RADIUS * Math.random()
    } else {
      radius = CORE_RADIUS + Math.random() * (GALAXY_RADIUS - CORE_RADIUS)
    }

    const spiralAngle = radius * 3.5
    const scatter = (Math.random() - 0.5) * ARM_SPREAD * (1 - radius * 0.5)

    const z = (Math.random() - 0.5) * 0.04 * (1 - radius * 1.2)

    // Color: core stars are warmer, outer stars are bluer/cooler
    let color: [number, number, number]
    const colorRand = Math.random()
    if (isCore || radius < 0.12) {
      // warm core: golds, oranges, whites
      if (colorRand < 0.3) color = [255, 220, 150]
      else if (colorRand < 0.6) color = [255, 200, 120]
      else color = [255, 240, 220]
    } else if (radius < 0.25) {
      // mid: whites, pale blues, some gold
      if (colorRand < 0.3) color = [200, 210, 255]
      else if (colorRand < 0.5) color = [255, 230, 180]
      else color = [240, 240, 255]
    } else {
      // outer: blues, pale whites
      if (colorRand < 0.4) color = [170, 190, 255]
      else if (colorRand < 0.6) color = [200, 200, 240]
      else color = [220, 230, 255]
    }

    const brightness = isCore
      ? 0.4 + Math.random() * 0.6
      : 0.15 + Math.random() * 0.65

    const size = isCore
      ? 0.5 + Math.random() * 1.8
      : 0.3 + Math.random() * 1.2

    stars.push({
      angle: armAngle + spiralAngle + scatter,
      radius,
      armOffset: scatter,
      z,
      size,
      brightness,
      color,
      speed: 0.3 + Math.random() * 0.7,
    })
  }

  return stars
}

export default function GalaxySimulation() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const starsRef = useRef<Star[]>([])
  const timeRef = useRef(0)
  const animRef = useRef<number>(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d', { alpha: true })
    if (!ctx) return

    starsRef.current = createStars()

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas!.width = window.innerWidth * dpr
      canvas!.height = window.innerHeight * dpr
      canvas!.style.width = window.innerWidth + 'px'
      canvas!.style.height = window.innerHeight + 'px'
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    resize()
    window.addEventListener('resize', resize)

    function draw() {
      const w = window.innerWidth
      const h = window.innerHeight
      const cx = w * 0.5
      const cy = h * 0.48
      const scale = Math.min(w, h)

      ctx!.clearRect(0, 0, w, h)

      timeRef.current += 1

      // Draw galactic core glow — indigo-shifted
      const coreGrad = ctx!.createRadialGradient(cx, cy, 0, cx, cy, scale * 0.15)
      coreGrad.addColorStop(0, 'rgba(129, 140, 248, 0.1)')
      coreGrad.addColorStop(0.2, 'rgba(99, 102, 241, 0.05)')
      coreGrad.addColorStop(0.5, 'rgba(67, 56, 202, 0.02)')
      coreGrad.addColorStop(1, 'transparent')
      ctx!.fillStyle = coreGrad
      ctx!.fillRect(0, 0, w, h)

      // Secondary glow
      const coreGrad2 = ctx!.createRadialGradient(cx, cy, 0, cx, cy, scale * 0.06)
      coreGrad2.addColorStop(0, 'rgba(165, 180, 255, 0.15)')
      coreGrad2.addColorStop(0.5, 'rgba(129, 140, 248, 0.04)')
      coreGrad2.addColorStop(1, 'transparent')
      ctx!.fillStyle = coreGrad2
      ctx!.fillRect(0, 0, w, h)

      // Draw nebula clouds along arms
      const nebulaTime = timeRef.current * ROTATION_SPEED * 0.3
      for (let arm = 0; arm < NUM_ARMS; arm++) {
        const baseAngle = (arm / NUM_ARMS) * Math.PI * 2
        for (let j = 0; j < 3; j++) {
          const nr = 0.12 + j * 0.1
          const nAngle = baseAngle + nr * 3.5 + nebulaTime
          const tilt = 0.35
          const nx = cx + Math.cos(nAngle) * nr * scale
          const ny = cy + Math.sin(nAngle) * nr * scale * tilt

          const nebGrad = ctx!.createRadialGradient(nx, ny, 0, nx, ny, scale * 0.06)

          if (arm % 2 === 0) {
            nebGrad.addColorStop(0, 'rgba(100, 120, 200, 0.015)')
            nebGrad.addColorStop(1, 'transparent')
          } else {
            nebGrad.addColorStop(0, 'rgba(180, 140, 200, 0.012)')
            nebGrad.addColorStop(1, 'transparent')
          }
          ctx!.fillStyle = nebGrad
          ctx!.fillRect(0, 0, w, h)
        }
      }

      // Draw stars
      const rotation = timeRef.current * ROTATION_SPEED
      const tilt = 0.35 // galaxy tilt (edge-on factor)

      const stars = starsRef.current
      for (let i = 0; i < stars.length; i++) {
        const s = stars[i]
        const angle = s.angle + rotation * s.speed
        const x = cx + Math.cos(angle) * s.radius * scale
        const y = cy + Math.sin(angle) * s.radius * scale * tilt + s.z * scale

        // skip offscreen
        if (x < -10 || x > w + 10 || y < -10 || y > h + 10) continue

        // twinkle
        const twinkle = 0.7 + 0.3 * Math.sin(timeRef.current * 0.02 * s.speed + i)
        const alpha = s.brightness * twinkle

        const [r, g, b] = s.color
        ctx!.fillStyle = `rgba(${r},${g},${b},${alpha})`

        if (s.size > 1.2) {
          // brighter stars get a soft glow
          ctx!.beginPath()
          ctx!.arc(x, y, s.size * 1.5, 0, Math.PI * 2)
          ctx!.fillStyle = `rgba(${r},${g},${b},${alpha * 0.15})`
          ctx!.fill()

          ctx!.beginPath()
          ctx!.arc(x, y, s.size * 0.7, 0, Math.PI * 2)
          ctx!.fillStyle = `rgba(${r},${g},${b},${alpha})`
          ctx!.fill()
        } else {
          ctx!.fillRect(x, y, s.size, s.size)
        }
      }

      // Dust lane (dark band across galaxy center for realism)
      const dustGrad = ctx!.createLinearGradient(cx - scale * 0.3, cy, cx + scale * 0.3, cy)
      dustGrad.addColorStop(0, 'transparent')
      dustGrad.addColorStop(0.3, 'rgba(10, 10, 15, 0.08)')
      dustGrad.addColorStop(0.5, 'rgba(10, 10, 15, 0.12)')
      dustGrad.addColorStop(0.7, 'rgba(10, 10, 15, 0.08)')
      dustGrad.addColorStop(1, 'transparent')
      ctx!.fillStyle = dustGrad
      ctx!.fillRect(cx - scale * 0.35, cy - scale * 0.01, scale * 0.7, scale * 0.02)

      animRef.current = requestAnimationFrame(draw)
    }

    draw()

    return () => {
      window.removeEventListener('resize', resize)
      cancelAnimationFrame(animRef.current)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
      }}
    />
  )
}
