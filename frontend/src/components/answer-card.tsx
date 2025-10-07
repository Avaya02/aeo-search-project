"use client"

import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { ExternalLink } from "lucide-react"
import { motion } from "framer-motion"
import type { Citation } from "./types"

interface Props {
  answer: string
  citations: Citation[]
}

export default function AnswerCard({ answer, citations }: Props) {
  if (!answer) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      aria-live="polite"
      aria-atomic="false"
      role="region"
    >
      <Card className="backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <CardHeader>
          <CardTitle className="text-lg">Answer</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="leading-relaxed text-foreground/90">{answer}</p>

          {citations?.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-medium">Sources</h3>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {citations.map((c, i) => (
                  <li key={i}>
                    <a
                      href={c.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group block rounded-md border bg-card/50 p-3 transition-colors hover:bg-accent hover:text-accent-foreground"
                    >
                      <span className="font-medium line-clamp-1 group-hover:underline">{c.title}</span>
                      <span className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground line-clamp-1">
                        <ExternalLink className="size-3.5" aria-hidden="true" />
                        {c.url}
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
