"use client"

import { motion } from "framer-motion"
import type { Citation } from "@/components/type"
import { ExternalLink } from "lucide-react"

interface Props {
  answer: string;
  citations: Citation[];
}

export default function AnswerCard({ answer, citations }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="bg-neutral-900/50 backdrop-blur-md p-4 sm:p-5 rounded-lg border border-neutral-800">
        <h2 className="text-lg font-semibold text-neutral-200 mb-3">Answer</h2>
        <p className="text-neutral-300 leading-relaxed text-sm mb-6">{answer}</p>
        
        {citations.length > 0 && (
          <div className="space-y-4">
             <h3 className="text-md font-semibold text-neutral-200">Sources</h3>
            {citations.map((c, idx) => (
              <motion.div
                key={c.url + String(idx)}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: idx * 0.08 }}
                className="border-t border-neutral-800 pt-4"
              >
                <p className="text-sm text-neutral-300 leading-relaxed">
                  <span className="font-semibold text-neutral-100">{idx + 1}.</span> {c.description}{" "}
                  <a
                    href={c.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-emerald-400 hover:text-emerald-300 underline underline-offset-2"
                  >
                    [Source]
                    <ExternalLink className="size-3.5" />
                  </a>
                </p>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  )
}