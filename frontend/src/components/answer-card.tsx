"use client"

import { motion } from "framer-motion"
import type { Citation } from "@/components/type"
import { ExternalLink } from "lucide-react"

function getHostname(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

interface Props {
  answer: string;
  citations: Citation[];
}

export default function AnswerCard({ answer, citations }: Props) {
  return (
    <motion.div
      className="space-y-4"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="bg-neutral-900/50 backdrop-blur-md p-4 rounded-lg border border-neutral-800">
        <h2 className="text-md font-semibold text-neutral-200 mb-2">Answer</h2>
        <p className="text-neutral-300 leading-relaxed text-sm">{answer}</p>
      </div>
      
      {citations.length > 0 && (
        <div className="space-y-2">
          {citations.map((c, idx) => (
            <motion.div
              key={c.url + String(idx)}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: idx * 0.05 }}
            >
              <a
                href={c.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block p-2.5 bg-neutral-800/40 hover:bg-neutral-800/80 border border-neutral-700/60 rounded-lg transition-colors group"
              >
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-sm text-emerald-400 truncate group-hover:underline">
                    {idx + 1}. {c.title}
                  </p>
                  <ExternalLink className="size-4 text-neutral-500 group-hover:text-emerald-400 transition-colors flex-shrink-0 ml-2" />
                </div>
                <p className="text-xs text-neutral-400 truncate mt-1">
                  {getHostname(c.url)}
                </p>
              </a>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  )
}