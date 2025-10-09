"use client"

import { useEffect, useRef } from "react"

export default function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let width = (canvas.width = window.innerWidth)
    let height = (canvas.height = window.innerHeight)
    let particles: Particle[] = []
    
    const mouse = {
      x: width / 2,
      y: height / 2,
    }

    class Particle {
      x: number; y: number; size: number;
      vx: number; vy: number;

      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.size = Math.random() * 1.2 + 0.3; // Made particles slightly smaller
        this.vx = Math.random() * 0.4 - 0.2;
        this.vy = Math.random() * 0.4 - 0.2;
      }

      update() {
        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 250) { // Increased mouse influence radius
          const forceDirectionX = dx / distance;
          const forceDirectionY = dy / distance;
          const force = (250 - distance) / 250 * 0.15; // Reduced force for a gentler pull
          this.vx += forceDirectionX * force;
          this.vy += forceDirectionY * force;
        }

        this.vx *= 0.98;
        this.vy *= 0.98;
        
        this.x += this.vx;
        this.y += this.vy;

        if (this.x > width || this.x < 0) this.vx *= -1;
        if (this.y > height || this.y < 0) this.vy *= -1;
      }

      draw() {
        ctx!.beginPath();
        ctx!.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        // --- FIX: Reduced particle opacity from 0.5 to 0.25 ---
        ctx!.fillStyle = 'rgba(128, 128, 128, 0.25)';
        ctx!.fill();
      }
    }

    const init = () => {
      particles = [];
      const numberOfParticles = Math.floor(width * height / 18000); // Reduced particle count
      for (let i = 0; i < numberOfParticles; i++) {
        particles.push(new Particle());
      }
    }

    const connect = () => {
      for (let a = 0; a < particles.length; a++) {
        for (let b = a; b < particles.length; b++) {
          const dx = particles[a].x - particles[b].x;
          const dy = particles[a].y - particles[b].y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (distance < 150) { // Increased connection distance slightly
            ctx!.beginPath();
            ctx!.moveTo(particles[a].x, particles[a].y);
            ctx!.lineTo(particles[b].x, particles[b].y);
            // --- FIX: Halved the line opacity for a much fainter effect ---
            const lineOpacity = (1 - distance / 150) * 0.5;
            ctx!.strokeStyle = `rgba(128, 128, 128, ${lineOpacity})`;
            ctx!.lineWidth = 0.2;
            ctx!.stroke();
          }
        }
      }
    }

    const animate = () => {
      ctx!.clearRect(0, 0, width, height); // Clear canvas instead of fading
      particles.forEach(p => { p.update(); p.draw(); });
      connect();
      requestAnimationFrame(animate);
    }

    const handleMouseMove = (event: MouseEvent) => {
      mouse.x = event.x;
      mouse.y = event.y;
    }

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      init();
    }

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('resize', handleResize);
    
    init();
    animate();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
    }
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 -z-10 pointer-events-none bg-[#0A0A0A]"
      aria-hidden="true"
    />
  );
}