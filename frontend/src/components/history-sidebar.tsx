"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Clock, MessageSquare, X, Trash2 } from "lucide-react"

import type { SearchResult } from "./type"

interface Props {
  history: SearchResult[];
  onHistoryClick: (result: SearchResult) => void;
  isOpen: boolean;
  onToggle: () => void;
}

export default function HistorySidebar({ history, onHistoryClick, isOpen, onToggle }: Props) {
  const formatTime = (timestamp?: number) => {
    if (!timestamp) return "Just now";
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <>
      {/* Toggle Button */}
      <motion.button
        onClick={onToggle}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="fixed top-6 left-6 z-50 p-3 bg-gradient-to-br from-neutral-800 to-neutral-900 hover:from-neutral-700 hover:to-neutral-800 backdrop-blur-xl rounded-xl text-neutral-100 transition-all shadow-lg shadow-black/20 border border-neutral-700/50"
        aria-label="Toggle history sidebar"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <X className="size-5" />
            </motion.div>
          ) : (
            <motion.div
              key="open"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <MessageSquare className="size-5" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Backdrop Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-30"
            onClick={onToggle}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ x: isOpen ? 0 : "-100%" }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
        className="fixed top-0 left-0 h-full w-80 bg-gradient-to-b from-neutral-900 via-neutral-900 to-neutral-950 backdrop-blur-xl border-r border-neutral-800/50 z-40 shadow-2xl"
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="px-6 pt-20 pb-6 border-b border-neutral-800/50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-lg border border-blue-500/20">
                <Clock className="size-5 text-blue-400" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-neutral-100">Search History</h2>
                <p className="text-xs text-neutral-500 mt-0.5">{history.length} recent searches</p>
              </div>
            </div>
          </div>

          {/* History List */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2 scrollbar-thin scrollbar-thumb-neutral-800 scrollbar-track-transparent">
            {history.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center h-full text-center px-4"
              >
                <div className="p-4 bg-neutral-800/30 rounded-2xl mb-4">
                  <MessageSquare className="size-8 text-neutral-600" />
                </div>
                <p className="text-sm text-neutral-400 font-medium">No searches yet</p>
                <p className="text-xs text-neutral-600 mt-2 max-w-[200px]">Your search history will appear here</p>
              </motion.div>
            ) : (
              <AnimatePresence mode="popLayout">
                {history.map((item, index) => (
                  <motion.button
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20, height: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ scale: 1.02, x: 4 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => onHistoryClick(item)}
                    className="group w-full text-left p-4 rounded-xl bg-gradient-to-br from-neutral-800/40 to-neutral-800/20 hover:from-neutral-800/60 hover:to-neutral-800/40 transition-all duration-200 border border-neutral-700/30 hover:border-neutral-600/50 relative overflow-hidden"
                  >
                    {/* Subtle gradient overlay on hover */}
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/5 to-cyan-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    <div className="relative flex items-start gap-3">
                      <div className="mt-0.5 p-1.5 bg-neutral-700/50 rounded-lg group-hover:bg-blue-500/20 transition-colors">
                        <MessageSquare className="size-3.5 text-neutral-400 group-hover:text-blue-400 transition-colors" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-neutral-200 font-medium line-clamp-2 group-hover:text-neutral-100 transition-colors">
                          {item.query}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <Clock className="size-3 text-neutral-600" />
                          <span className="text-xs text-neutral-500">{formatTime(item.timestamp)}</span>
                        </div>
                      </div>
                    </div>
                  </motion.button>
                ))}
              </AnimatePresence>
            )}
          </div>

          {/* Footer */}
          {history.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="px-6 py-4 border-t border-neutral-800/50 bg-neutral-900/50"
            >
              <button className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm text-neutral-400 hover:text-red-400 hover:bg-red-500/5 rounded-lg transition-all duration-200 border border-neutral-800/50 hover:border-red-500/20">
                <Trash2 className="size-4" />
                Clear History
              </button>
            </motion.div>
          )}
        </div>
      </motion.aside>
    </>
  )
}
