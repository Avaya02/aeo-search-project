"use client"

import { useState } from "react"
import type { FormEvent } from "react"
import axios from "axios"
import { motion } from "framer-motion"
import { Search } from "lucide-react"

import { Input } from "./components/ui/input"
import { Button } from "./components/ui/buttons"
import { Card, CardContent } from "./components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "./components/ui/alert"

import AnimatedBackground from "./components/animated-background"
import SearchHeader from "./components/search-header"
import AnswerCard from "./components/answer-card"
import LoadingState from "./components/loading-state"
import type { ApiResponse, Citation } from "./components/type"

export default function Page() {
  const [query, setQuery] = useState("")
  const [answer, setAnswer] = useState("")
  const [citations, setCitations] = useState<Citation[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  // preserve functional logic and API calls
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
    <main className="relative min-h-dvh bg-background text-foreground">
      <AnimatedBackground />

      <section className="mx-auto flex min-h-dvh max-w-3xl flex-col items-stretch gap-8 px-4 py-10 md:py-16">
        <SearchHeader />

        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
          <Card className="sticky top-4 z-10 border-border/70 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-card/70">
            <CardContent className="p-3 md:p-4">
              <form onSubmit={handleSearch} className="relative" aria-busy={isLoading}>
                <label htmlFor="query" className="sr-only">
                  Ask a question
                </label>

                {/* Input as chatbox with embedded button */}
                <div className="relative">
                  <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-muted-foreground">
                    <Search className="size-4" aria-hidden="true" />
                  </span>
                  <Input
                    id="query"
                    name="query"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Show me the best kurtas for men"
                    className="pl-9 pr-28 h-12 text-base rounded-xl"
                    disabled={isLoading}
                    aria-describedby="query-help"
                  />
                  <Button
                    type="submit"
                    disabled={isLoading || !query.trim()}
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-9 px-4 rounded-lg bg-black text-white hover:bg-black/90"
                  >
                    {isLoading ? "Asking..." : "Ask"}
                  </Button>
                </div>

                <p id="query-help" className="sr-only">
                  Type your question and press Enter or click Ask
                </p>
              </form>
            </CardContent>
          </Card>
        </motion.div>

        <div className="space-y-6" aria-live="polite">
          {isLoading && <LoadingState />}

          {error && (
            <Alert variant="destructive" role="alert">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {!isLoading && answer && <AnswerCard answer={answer} citations={citations} />}
        </div>

        {/* <footer className="mt-auto pb-4 text-center text-xs text-muted-foreground">
          <span className="opacity-80">Built with shadcn/ui, Framer Motion, and Lucide.</span>
        </footer> */}
      </section>
    </main>
  )
}
