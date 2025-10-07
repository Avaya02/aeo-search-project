"use client"

import { motion } from "framer-motion"
import { MessageSquare, X } from "lucide-react"

import type { SearchResult } from "./type"

interface Props {
  history: SearchResult[];
  onHistoryClick: (result: SearchResult) => void;
  isOpen: boolean;
  onToggle: () => void;
}

export default function HistorySidebar({ history, onHistoryClick, isOpen, onToggle }: Props) {
  return (
    <>
      <button 
        onClick={onToggle}
        className="fixed top-4 left-4 z-50 p-2 bg-neutral-800/50 hover:bg-neutral-700/80 backdrop-blur-md rounded-full text-neutral-300 transition-colors"
        aria-label="Toggle history sidebar"
      >
        {isOpen ? <X className="size-5" /> : <MessageSquare className="size-5" />}
      </button>

      <motion.aside
        initial={false}
        animate={{ x: isOpen ? 0 : "-100%" }}
        transition={{ type: "tween", ease: "easeInOut", duration: 0.3 }}
        className="fixed top-0 left-0 h-full w-72 bg-neutral-900/80 backdrop-blur-lg border-r border-neutral-800 z-40 p-4"
      >
        <h2 className="text-lg font-semibold text-neutral-200 mt-12 mb-4">Search History</h2>
        {history.length === 0 ? (
          <p className="text-sm text-neutral-500">Your search history will appear here.</p>
        ) : (
          <div className="space-y-2">
            {history.map((item, index) => (
              <button
                key={index}
                onClick={() => onHistoryClick(item)}
                className="w-full text-left p-2 rounded-md bg-neutral-800/50 hover:bg-neutral-800 transition-colors"
              >
                <p className="text-sm text-neutral-300 truncate">{item.query}</p>
              </button>
            ))}
          </div>
        )}
      </motion.aside>
    </>
  )
}
