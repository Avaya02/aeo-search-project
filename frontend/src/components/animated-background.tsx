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
    let stars: Star[] = []
    const starCount = 60;

    class Star {
      // These are the properties that were causing the error
      x: number; 
      y: number; 
      radius: number; 
      vx: number; 
      vy: number; 
      alpha: number;
      trail: { x: number; y: number }[];

      constructor() {
        // --- FIX: All properties are now initialized directly in the constructor ---
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.radius = Math.random() * 1 + 0.5;
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 3 + 1; // Made stars a bit faster
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
        this.alpha = 1;
        this.trail = [];
      }

      reset() {
        // The reset logic is the same as the constructor
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.alpha = 1;
        this.trail = [];
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 3 + 1;
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
      }

      update() {
        this.trail.push({ x: this.x, y: this.y });
        if (this.trail.length > 15) { // A slightly longer trail
          this.trail.shift();
        }
        
        this.x += this.vx;
        this.y += this.vy;
        this.alpha -= 0.015;

        if (this.alpha <= 0) {
          this.reset();
        }
      }

      draw() {
        ctx!.fillStyle = `rgba(255, 255, 255, ${this.alpha})`;
        ctx!.beginPath();
        ctx!.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx!.fill();
        
        for (let i = 0; i < this.trail.length; i++) {
          const ratio = (i + 1) / this.trail.length;
          ctx!.beginPath();
          ctx!.arc(this.trail[i].x, this.trail[i].y, this.radius * ratio * 0.5, 0, Math.PI * 2);
          ctx!.fillStyle = `rgba(255, 255, 255, ${this.alpha * ratio * 0.3})`;
          ctx!.fill();
        }
      }
    }

    const createStars = () => { stars = []; for (let i = 0; i < starCount; i++) stars.push(new Star()); }
    const animate = () => {
      ctx!.fillStyle = 'rgba(10, 10, 10, 0.1)'; // Slow fade effect for trails
      ctx!.fillRect(0, 0, width, height);
      stars.forEach((s) => { s.update(); s.draw(); });
      requestAnimationFrame(animate);
    }
    const handleResize = () => { width = canvas.width = window.innerWidth; height = canvas.height = window.innerHeight; createStars(); }

    window.addEventListener("resize", handleResize);
    createStars();
    animate();

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 -z-10  bg-[#0A0A0A] border-4 border-red-500"
      aria-hidden="true"
    />
  );
}