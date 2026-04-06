'use client'

import { useEffect, useRef, useState } from 'react'

interface Props {
  text: string
  highlightWord?: string
  fontSize?: number
}

interface LightningBolt {
  x: number
  y: number
  life: number
  maxLife: number
  segments: { x: number; y: number }[]
  brightness: number
}

export default function ShaderText({ text, highlightWord = 'You', fontSize: baseFontSize = 80 }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animRef = useRef<number>(0)
  const textDataRef = useRef<ImageData | null>(null)
  const boltsRef = useRef<LightningBolt[]>([])
  const [dimensions, setDimensions] = useState({ w: 800, h: 200 })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d', { willReadFrequently: true })
    if (!ctx) return

    // Responsive font size
    const vw = Math.min(window.innerWidth, 1200)
    const responsiveFontSize = Math.max(32, Math.min(baseFontSize, vw * 0.08))
    const fontWeight = 800

    // Measure text
    ctx.font = `${fontWeight} ${responsiveFontSize}px Orbitron, sans-serif`
    const metrics = ctx.measureText(text)
    const textWidth = metrics.width + 40
    const textHeight = responsiveFontSize * 2.2

    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const w = Math.ceil(textWidth)
    const h = Math.ceil(textHeight)

    setDimensions({ w, h })

    canvas.width = w * dpr
    canvas.height = h * dpr
    canvas.style.width = w + 'px'
    canvas.style.height = h + 'px'
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

    // Render text to get pixel data for the mask
    ctx.clearRect(0, 0, w, h)
    ctx.font = `${fontWeight} ${responsiveFontSize}px Orbitron, sans-serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillStyle = '#ffffff'
    ctx.fillText(text, w / 2, h / 2)
    textDataRef.current = ctx.getImageData(0, 0, w * dpr, h * dpr)

    // Find word positions for highlight
    const words = text.split(' ')
    let beforeHighlight = ''
    for (const word of words) {
      if (word === highlightWord) break
      beforeHighlight += word + ' '
    }
    const beforeWidth = ctx.measureText(beforeHighlight).width
    const highlightWidth = ctx.measureText(highlightWord).width
    const textStartX = w / 2 - metrics.width / 2

    const highlightBounds = {
      x: textStartX + beforeWidth,
      w: highlightWidth,
      cx: textStartX + beforeWidth + highlightWidth / 2,
      cy: h / 2,
    }

    let time = 0

    function spawnBolt() {
      // Spawn lightning from text edges
      const textMask = textDataRef.current
      if (!textMask) return

      // Random position near text
      const bx = w * 0.15 + Math.random() * w * 0.7
      const by = h * 0.2 + Math.random() * h * 0.6

      const segments: { x: number; y: number }[] = [{ x: bx, y: by }]
      let cx = bx
      let cy = by
      const numSegs = 4 + Math.floor(Math.random() * 8)
      const spread = 15 + Math.random() * 30

      for (let i = 0; i < numSegs; i++) {
        cx += (Math.random() - 0.5) * spread
        cy += (Math.random() - 0.5) * spread * 0.6
        segments.push({ x: cx, y: cy })
      }

      boltsRef.current.push({
        x: bx,
        y: by,
        life: 1,
        maxLife: 0.3 + Math.random() * 0.4,
        segments,
        brightness: 0.5 + Math.random() * 0.5,
      })
    }

    function draw() {
      time += 0.016
      ctx!.clearRect(0, 0, w, h)

      // Spawn new bolts occasionally
      if (Math.random() < 0.15) spawnBolt()
      if (Math.random() < 0.08) spawnBolt() // double chance sometimes

      // Dark/light contrast wave across text
      const waveX = (Math.sin(time * 1.5) * 0.5 + 0.5) * w
      const waveWidth = w * 0.4

      // Draw base text with darkness variation
      ctx!.font = `${fontWeight} ${responsiveFontSize}px Orbitron, sans-serif`
      ctx!.textAlign = 'center'
      ctx!.textBaseline = 'middle'

      // Shadow layer (deep darkness)
      ctx!.fillStyle = 'rgba(20, 20, 50, 0.9)'
      ctx!.fillText(text, w / 2, h / 2)

      // Main text with indigo tint - darkness wave
      const gradient = ctx!.createLinearGradient(0, 0, w, 0)
      const wavePos = waveX / w

      // Create rolling darkness/brightness contrast
      for (let i = 0; i <= 10; i++) {
        const t = i / 10
        const dist = Math.abs(t - wavePos)
        const intensity = Math.max(0, 1 - dist * 3)

        // Bright spots are electric indigo, dark spots are near-black
        if (intensity > 0.3) {
          gradient.addColorStop(t, `rgba(129, 140, 248, ${0.4 + intensity * 0.6})`)
        } else {
          gradient.addColorStop(t, `rgba(40, 42, 80, ${0.3 + intensity * 0.2})`)
        }
      }

      ctx!.fillStyle = gradient
      ctx!.fillText(text, w / 2, h / 2)

      // Highlight word gets extra brightness
      const words2 = text.split(' ')
      let xOff = 0
      ctx!.textAlign = 'left'
      const fullWidth = ctx!.measureText(text).width
      const startX = w / 2 - fullWidth / 2

      for (const word of words2) {
        const wWidth = ctx!.measureText(word + ' ').width
        if (word === highlightWord) {
          const hlPulse = 0.6 + 0.4 * Math.sin(time * 3)

          // Glow behind highlight word
          ctx!.shadowColor = `rgba(99, 102, 241, ${hlPulse * 0.6})`
          ctx!.shadowBlur = 20 + hlPulse * 15
          ctx!.fillStyle = `rgba(160, 170, 255, ${0.7 + hlPulse * 0.3})`
          ctx!.fillText(word, startX + xOff, h / 2)
          ctx!.shadowBlur = 0
          ctx!.shadowColor = 'transparent'
        }
        xOff += wWidth
      }
      ctx!.textAlign = 'center'

      // Draw lightning bolts
      const bolts = boltsRef.current
      for (let i = bolts.length - 1; i >= 0; i--) {
        const bolt = bolts[i]
        bolt.life -= 0.016 / bolt.maxLife

        if (bolt.life <= 0) {
          bolts.splice(i, 1)
          continue
        }

        const alpha = bolt.life * bolt.brightness
        const segs = bolt.segments

        // Main bolt
        ctx!.beginPath()
        ctx!.moveTo(segs[0].x, segs[0].y)
        for (let s = 1; s < segs.length; s++) {
          // Add jitter each frame for electrical feel
          const jx = segs[s].x + (Math.random() - 0.5) * 3
          const jy = segs[s].y + (Math.random() - 0.5) * 2
          ctx!.lineTo(jx, jy)
        }
        ctx!.strokeStyle = `rgba(180, 190, 255, ${alpha * 0.8})`
        ctx!.lineWidth = 1.5 * bolt.life
        ctx!.stroke()

        // Glow
        ctx!.strokeStyle = `rgba(99, 102, 241, ${alpha * 0.3})`
        ctx!.lineWidth = 4 * bolt.life
        ctx!.stroke()

        // Bright core
        ctx!.strokeStyle = `rgba(220, 225, 255, ${alpha * 0.6})`
        ctx!.lineWidth = 0.5 * bolt.life
        ctx!.stroke()
      }

      // Occasional full flash (lightning strike moment)
      if (Math.random() < 0.005) {
        ctx!.fillStyle = 'rgba(99, 102, 241, 0.08)'
        ctx!.fillRect(0, 0, w, h)
      }

      // Scanline effect for shader feel
      for (let y = 0; y < h; y += 3) {
        const scanAlpha = 0.02 + 0.01 * Math.sin(y * 0.5 + time * 8)
        ctx!.fillStyle = `rgba(0, 0, 0, ${scanAlpha})`
        ctx!.fillRect(0, y, w, 1)
      }

      animRef.current = requestAnimationFrame(draw)
    }

    draw()

    const handleResize = () => {
      cancelAnimationFrame(animRef.current)
      // Re-run effect on resize
    }

    window.addEventListener('resize', handleResize)

    return () => {
      cancelAnimationFrame(animRef.current)
      window.removeEventListener('resize', handleResize)
    }
  }, [text, highlightWord, baseFontSize])

  return (
    <canvas
      ref={canvasRef}
      style={{
        display: 'block',
        width: dimensions.w,
        height: dimensions.h,
        maxWidth: '90vw',
      }}
    />
  )
}
