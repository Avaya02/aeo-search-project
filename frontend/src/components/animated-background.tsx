"use client"

import { useEffect, useRef } from "react"

interface Props {
  className?: string
}

export default function AnimatedBackground({ className }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let dpr = Math.max(1, window.devicePixelRatio || 1)
    let width = window.innerWidth
    let height = window.innerHeight
    canvas.width = Math.floor(width * dpr)
    canvas.height = Math.floor(height * dpr)
    canvas.style.width = width + "px"
    canvas.style.height = height + "px"
    ctx.scale(dpr, dpr)

    const spacing = 32
    const dotRadius = 0.75
    let t = 0

    // --- Compute foreground color from CSS variables ---
    const rootStyles = getComputedStyle(document.documentElement)
    const fgVar = rootStyles.getPropertyValue("--color-foreground")?.trim() || "#ffffff"

    const toRGBA = (hex: string, alpha: number) => {
      if (hex.startsWith("#")) {
        const c = hex.slice(1)
        const bigint = parseInt(c, 16)
        const r = (bigint >> 16) & 255
        const g = (bigint >> 8) & 255
        const b = bigint & 255
        return `rgba(${r},${g},${b},${alpha})`
      }
      // fallback: try parsing as rgb() or named color
      return hex
    }

    const draw = () => {
      ctx.clearRect(0, 0, width, height)

      // subtle vignette
      const g = ctx.createRadialGradient(
        width * 0.5,
        height * 0.45,
        Math.min(width, height) * 0.1,
        width * 0.5,
        height * 0.5,
        Math.max(width, height) * 0.9,
      )
      g.addColorStop(0, "transparent")
      g.addColorStop(1, toRGBA(fgVar, 0.03))
      ctx.fillStyle = g
      ctx.fillRect(0, 0, width, height)

      // subtle drift
      const ox = Math.sin(t * 0.0006) * 8
      const oy = Math.cos(t * 0.0005) * 8

      // draw dot grid
      ctx.fillStyle = toRGBA(fgVar, 0.06)
      for (let y = -spacing; y < height + spacing; y += spacing) {
        for (let x = -spacing; x < width + spacing; x += spacing) {
          ctx.beginPath()
          ctx.arc(x + ox, y + oy, dotRadius, 0, Math.PI * 2)
          ctx.fill()
        }
      }

      t += 16
      requestAnimationFrame(draw)
    }

    const onResize = () => {
      dpr = Math.max(1, window.devicePixelRatio || 1)
      width = window.innerWidth
      height = window.innerHeight
      canvas.width = Math.floor(width * dpr)
      canvas.height = Math.floor(height * dpr)
      canvas.style.width = width + "px"
      canvas.style.height = height + "px"
      ctx.setTransform(1, 0, 0, 1, 0, 0)
      ctx.scale(dpr, dpr)
    }

    window.addEventListener("resize", onResize)
    draw()
    return () => window.removeEventListener("resize", onResize)
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className={`fixed inset-0 -z-10 pointer-events-none ${className || ""}`}
      aria-hidden="true"
    />
  )
}
