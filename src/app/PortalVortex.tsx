'use client'

import { useEffect, useRef } from 'react'

const NUM_RINGS = 5
const PARTICLES_PER_RING = 120
const BASE_RADIUS = 120

interface Particle {
  ring: number
  angle: number
  speed: number
  size: number
  brightness: number
  offset: number
}

export default function PortalVortex() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animRef = useRef<number>(0)
  const particlesRef = useRef<Particle[]>([])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d', { alpha: true })
    if (!ctx) return

    // Create particles
    const particles: Particle[] = []
    for (let r = 0; r < NUM_RINGS; r++) {
      for (let i = 0; i < PARTICLES_PER_RING; i++) {
        particles.push({
          ring: r,
          angle: (i / PARTICLES_PER_RING) * Math.PI * 2 + Math.random() * 0.3,
          speed: 0.3 + r * 0.15 + Math.random() * 0.2,
          size: 0.5 + Math.random() * 1.5,
          brightness: 0.3 + Math.random() * 0.7,
          offset: (Math.random() - 0.5) * 8,
        })
      }
    }
    particlesRef.current = particles

    const SIZE = 340
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    canvas.width = SIZE * dpr
    canvas.height = SIZE * dpr
    canvas.style.width = SIZE + 'px'
    canvas.style.height = SIZE + 'px'
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

    let time = 0

    function draw() {
      const cx = SIZE / 2
      const cy = SIZE / 2
      ctx!.clearRect(0, 0, SIZE, SIZE)
      time += 0.008

      // Outer glow
      const outerGlow = ctx!.createRadialGradient(cx, cy, 0, cx, cy, BASE_RADIUS + 50)
      outerGlow.addColorStop(0, 'rgba(99, 102, 241, 0.0)')
      outerGlow.addColorStop(0.5, 'rgba(99, 102, 241, 0.03)')
      outerGlow.addColorStop(0.75, 'rgba(129, 140, 248, 0.06)')
      outerGlow.addColorStop(1, 'rgba(99, 102, 241, 0.0)')
      ctx!.fillStyle = outerGlow
      ctx!.fillRect(0, 0, SIZE, SIZE)

      // Draw rings
      for (let r = 0; r < NUM_RINGS; r++) {
        const ringRadius = 30 + r * 22
        const ringAlpha = 0.03 + (r / NUM_RINGS) * 0.06

        // Ring line
        ctx!.beginPath()
        ctx!.arc(cx, cy, ringRadius, 0, Math.PI * 2)
        ctx!.strokeStyle = `rgba(99, 102, 241, ${ringAlpha})`
        ctx!.lineWidth = 0.5
        ctx!.stroke()
      }

      // Draw particles
      const pts = particlesRef.current
      for (let i = 0; i < pts.length; i++) {
        const p = pts[i]
        const ringRadius = 30 + p.ring * 22 + p.offset
        const angle = p.angle + time * p.speed

        const x = cx + Math.cos(angle) * ringRadius
        const y = cy + Math.sin(angle) * ringRadius * 0.92 // slight ellipse

        // Pulse brightness
        const pulse = 0.6 + 0.4 * Math.sin(time * 3 + p.angle * 2 + p.ring)
        const alpha = p.brightness * pulse

        // Color varies by ring - inner is brighter indigo, outer is deeper
        const r_col = 99 + p.ring * 8
        const g_col = 102 + p.ring * 10
        const b_col = 241

        if (p.size > 1) {
          // Glow for larger particles
          const glow = ctx!.createRadialGradient(x, y, 0, x, y, p.size * 3)
          glow.addColorStop(0, `rgba(${r_col}, ${g_col}, ${b_col}, ${alpha * 0.4})`)
          glow.addColorStop(1, `rgba(${r_col}, ${g_col}, ${b_col}, 0)`)
          ctx!.fillStyle = glow
          ctx!.fillRect(x - p.size * 3, y - p.size * 3, p.size * 6, p.size * 6)
        }

        ctx!.beginPath()
        ctx!.arc(x, y, p.size * 0.6, 0, Math.PI * 2)
        ctx!.fillStyle = `rgba(${r_col}, ${g_col}, ${b_col}, ${alpha})`
        ctx!.fill()
      }

      // Central core glow
      const coreGrad = ctx!.createRadialGradient(cx, cy, 0, cx, cy, 35)
      coreGrad.addColorStop(0, `rgba(129, 140, 248, ${0.15 + 0.05 * Math.sin(time * 2)})`)
      coreGrad.addColorStop(0.4, 'rgba(99, 102, 241, 0.06)')
      coreGrad.addColorStop(1, 'transparent')
      ctx!.fillStyle = coreGrad
      ctx!.fillRect(0, 0, SIZE, SIZE)

      // Inner bright point
      const innerGrad = ctx!.createRadialGradient(cx, cy, 0, cx, cy, 8)
      innerGrad.addColorStop(0, `rgba(200, 210, 255, ${0.3 + 0.1 * Math.sin(time * 4)})`)
      innerGrad.addColorStop(1, 'transparent')
      ctx!.fillStyle = innerGrad
      ctx!.fillRect(cx - 10, cy - 10, 20, 20)

      // Lightning/energy arcs (4 random arcs that flicker)
      for (let a = 0; a < 4; a++) {
        const arcAngle = time * 0.5 + (a * Math.PI) / 2
        const flicker = Math.random()
        if (flicker < 0.3) continue // skip some frames for flicker

        const startR = 25
        const endR = 30 + a * 22
        const segments = 8

        ctx!.beginPath()
        ctx!.moveTo(
          cx + Math.cos(arcAngle) * startR,
          cy + Math.sin(arcAngle) * startR * 0.92
        )

        for (let s = 1; s <= segments; s++) {
          const t = s / segments
          const r = startR + (endR - startR) * t
          const jitter = (Math.random() - 0.5) * 12 * t
          const segAngle = arcAngle + jitter * 0.05
          ctx!.lineTo(
            cx + Math.cos(segAngle) * r + jitter,
            cy + Math.sin(segAngle) * r * 0.92 + jitter * 0.5
          )
        }

        ctx!.strokeStyle = `rgba(160, 170, 255, ${0.15 + flicker * 0.2})`
        ctx!.lineWidth = 0.5 + flicker
        ctx!.stroke()
      }

      animRef.current = requestAnimationFrame(draw)
    }

    draw()

    return () => cancelAnimationFrame(animRef.current)
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{
        display: 'block',
        margin: '0 auto 1rem',
        opacity: 0,
        animation: 'fadeIn 3s ease-out 0.2s forwards',
      }}
    />
  )
}
