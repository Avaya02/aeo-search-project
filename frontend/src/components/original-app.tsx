"use client"

import { useState, useEffect, useRef } from "react"
import type { FormEvent } from "react"
import axios from "axios"

// --- Helper Types ---
interface Citation {
  title: string
  url: string
}

interface ApiResponse {
  answer: string
  citations: Citation[]
}

// --- Icon Components ---
const SearchIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="11" cy="11" r="8"></circle>
    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
  </svg>
)

const LinkIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.72"></path>
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.72-1.72"></path>
  </svg>
)

// --- Main App Component ---
function App() {
  const [query, setQuery] = useState("")
  const [answer, setAnswer] = useState("")
  const [citations, setCitations] = useState<Citation[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const canvasRef = useRef<HTMLCanvasElement>(null)

  // --- Background Animation Effect ---
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let width = (canvas.width = window.innerWidth)
    let height = (canvas.height = window.innerHeight)
    let particles: Particle[] = []

    class Particle {
      x: number
      y: number
      vx: number
      vy: number
      radius: number

      constructor(x: number, y: number) {
        this.x = x
        this.y = y
        this.vx = Math.random() * 0.4 - 0.2
        this.vy = Math.random() * 0.4 - 0.2
        this.radius = Math.random() * 1.5
      }

      update() {
        this.x += this.vx
        this.y += this.vy

        if (this.x < 0 || this.x > width) this.vx *= -1
        if (this.y < 0 || this.y > height) this.vy *= -1
      }

      draw() {
        ctx!.beginPath()
        ctx!.arc(this.x, this.y, this.radius, 0, Math.PI * 2)
        ctx!.fillStyle = "rgba(255, 255, 255, 0.1)"
        ctx!.fill()
      }
    }

    const createParticles = () => {
      particles = []
      const particleCount = Math.floor((width * height) / 10000)
      for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle(Math.random() * width, Math.random() * height))
      }
    }

    const animate = () => {
      ctx!.clearRect(0, 0, width, height)
      particles.forEach((p) => {
        p.update()
        p.draw()
      })
      drawLines()
      requestAnimationFrame(animate)
    }

    const drawLines = () => {
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x
          const dy = particles[i].y - particles[j].y
          const distance = Math.sqrt(dx * dx + dy * dy)

          if (distance < 100) {
            ctx!.beginPath()
            ctx!.moveTo(particles[i].x, particles[i].y)
            ctx!.lineTo(particles[j].x, particles[j].y)
            ctx!.strokeStyle = `rgba(255, 255, 255, ${1 - distance / 100})`
            ctx!.lineWidth = 0.5
            ctx!.stroke()
          }
        }
      }
    }

    const handleResize = () => {
      width = canvas.width = window.innerWidth
      height = canvas.height = window.innerHeight
      createParticles()
    }

    window.addEventListener("resize", handleResize)

    createParticles()
    animate()

    return () => window.removeEventListener("resize", handleResize)
  }, [])

  // --- API Call Logic ---
  const handleSearch = async (e: FormEvent) => {
    e.preventDefault()
    if (!query.trim() || isLoading) return

    setIsLoading(true)
    setError("")
    setAnswer("")
    setCitations([])

    try {
      const response = await axios.post<ApiResponse>("http://localhost:5001/api/search", { query })
      setAnswer(response.data.answer)
      setCitations(response.data.citations)
    } catch (err) {
      setError("Failed to fetch results. Please try again.")
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <canvas ref={canvasRef} className="fixed top-0 left-0 w-full h-full -z-10 bg-gray-900"></canvas>
      <main className="min-h-screen flex flex-col items-center justify-center p-4 text-white font-sans">
        <div className="w-full max-w-2xl mx-auto">
          <header className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
              AEO Search Engine
            </h1>
            <p className="text-gray-400 mt-2">Ask a question and get a cited answer, powered by Bright Data.</p>
          </header>

          <form
            onSubmit={handleSearch}
            className="mb-8 sticky top-4 bg-gray-900/50 backdrop-blur-sm z-10 p-2 rounded-lg"
          >
            <div className="relative">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="What are you looking for?"
                className="w-full pl-10 pr-24 py-3 bg-gray-800 border border-gray-700 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                disabled={isLoading}
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                <SearchIcon />
              </span>
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-md transition-all disabled:bg-gray-600 disabled:cursor-not-allowed"
                disabled={isLoading || !query.trim()}
              >
                {isLoading ? "Asking..." : "Ask"}
              </button>
            </div>
          </form>

          <div className="space-y-8">
            {isLoading && (
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mx-auto"></div>
                <p className="mt-2 text-gray-400">Searching the web for answers...</p>
              </div>
            )}
            {error && <p className="text-red-400 text-center bg-red-900/50 p-3 rounded-md">{error}</p>}

            {answer && !isLoading && (
              <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-lg border border-gray-700 animate-fade-in">
                <h2 className="text-xl font-semibold text-gray-200 mb-4">Answer</h2>
                <p className="text-gray-300 leading-relaxed">{answer}</p>

                {citations.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold text-gray-200 mb-3">Sources</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {citations.map((citation, index) => (
                        <a
                          key={index}
                          href={citation.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-gray-700/50 hover:bg-gray-700 p-3 rounded-md border border-gray-600 transition-all group"
                        >
                          <p className="font-semibold text-blue-400 truncate group-hover:underline">{citation.title}</p>
                          <p className="text-xs text-gray-400 truncate flex items-center gap-1.5 mt-1">
                            <LinkIcon />
                            {citation.url}
                          </p>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  )
}

export default App
