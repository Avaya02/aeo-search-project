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

    let width = (canvas.width = window.innerWidth)
    let height = (canvas.height = window.innerHeight)

    type Particle = {
      x: number
      y: number
      vx: number
      vy: number
      r: number
    }

    let particles: Particle[] = []

    const createParticles = () => {
      particles = []
      const count = Math.floor((width * height) / 10000)
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: Math.random() * 0.4 - 0.2,
          vy: Math.random() * 0.4 - 0.2,
          r: Math.random() * 1.5 + 0.25,
        })
      }
    }

    const drawLines = () => {
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x
          const dy = particles[i].y - particles[j].y
          const dist = Math.hypot(dx, dy)
          if (dist < 100) {
            ctx.beginPath()
            ctx.moveTo(particles[i].x, particles[i].y)
            ctx.lineTo(particles[j].x, particles[j].y)
            // Using subtle foreground with low alpha to respect theme
            ctx.strokeStyle = `color-mix(in oklch, var(--color-foreground) 10%, transparent ${90 - (dist / 100) * 90}%)`
            ctx.lineWidth = 0.5
            ctx.stroke()
          }
        }
      }
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height)

      // Soft radial glow background using theme tokens
      const grd = ctx.createRadialGradient(
        width * 0.5,
        height * 0.4,
        Math.min(width, height) * 0.05,
        width * 0.5,
        height * 0.5,
        Math.max(width, height) * 0.8,
      )
      grd.addColorStop(0, "color-mix(in oklch, var(--color-primary) 10%, transparent)")
      grd.addColorStop(1, "transparent")
      ctx.fillStyle = grd
      ctx.fillRect(0, 0, width, height)

      for (const p of particles) {
        p.x += p.vx
        p.y += p.vy
        if (p.x < 0 || p.x > width) p.vx *= -1
        if (p.y < 0 || p.y > height) p.vy *= -1

        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = "color-mix(in oklch, var(--color-foreground) 8%, transparent)"
        ctx.fill()
      }

      drawLines()
      requestAnimationFrame(render)
    }

    const onResize = () => {
      width = canvas.width = window.innerWidth
      height = canvas.height = window.innerHeight
      createParticles()
    }

    window.addEventListener("resize", onResize)
    createParticles()
    render()
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
