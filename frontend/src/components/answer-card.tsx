"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ExternalLink } from "lucide-react"
import { motion } from "framer-motion"
import type { Citation } from "@/components/type"

function extractBrandFromUrl(url: string): string | null {
  try {
    const u = new URL(url)
    const host = u.hostname.toLowerCase().replace(/^www\./, "")
    const parts = host.split(".")
    const core = parts.length > 2 ? parts[parts.length - 2] : parts[0]
    return core.charAt(0).toUpperCase() + core.slice(1)
  } catch {
    return null
  }
}

function brandForCitation(c: Citation): string {
  return extractBrandFromUrl(c.url) || (c.title?.split(/\s+/)[0] || "Result").replace(/^./, (m: string) => m.toUpperCase())
}

function pickSentenceForBrand(answer: string, brand: string, max = 180): string {
  if (!answer) return ""
  const sentences = answer.split(/(?<=[.!?])\s+/)
  const match = sentences.find((s) => new RegExp(`\\b${brand}\\b`, "i").test(s)) || sentences.find((s) => s.length > 0)
  const text = match || answer
  if (text.length <= max) return text
  return text.slice(0, max - 1).trimEnd() + "…"
}

interface Props {
  answer: string
  citations: Citation[]
}

export default function AnswerCard({ answer, citations }: Props) {
  // If no citations, show one generic summary block
  if (!citations?.length) {
    const summary = pickSentenceForBrand(answer, "", 180)
    return (
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
        <Card className="backdrop-blur supports-[backdrop-filter]:bg-card/60">
          <CardHeader>
            <CardTitle className="text-lg">Result</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="leading-relaxed text-foreground/90">{summary}</p>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  return (
    <div className="space-y-4">
      {citations.map((c, idx) => {
        const brand = brandForCitation(c)
        const summary = pickSentenceForBrand(answer, brand, 180)
        return (
          <motion.div
            key={c.url + String(idx)}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: idx * 0.03 }}
            role="region"
            aria-live="polite"
          >
            <Card className="backdrop-blur supports-[backdrop-filter]:bg-card/60">
              <CardHeader>
                <CardTitle className="text-lg">{brand}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="leading-relaxed text-foreground/90">
                  {summary}{" "}
                  <a
                    href={c.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-primary underline-offset-4 hover:underline"
                    aria-label={`Source: ${c.title || c.url}`}
                  >
                    [Source] <ExternalLink className="size-3.5" aria-hidden="true" />
                  </a>
                </p>
              </CardContent>
            </Card>
          </motion.div>
        )
      })}
    </div>
  )
}
