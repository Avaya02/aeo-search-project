"use client"

import { motion } from "framer-motion"

export default function SearchHeader() {
  return (
    <header className="text-center space-y-2">
      <motion.h1
        className="text-balance text-3xl md:text-5xl font-semibold tracking-tight"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
      >
        AEO Search Engine
      </motion.h1>
      <motion.p
        className="text-pretty text-muted-foreground"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15, duration: 0.4, ease: "easeOut" }}
      >
        Ask a question and get a cited answer, powered by Bright Data.
      </motion.p>
    </header>
  )
}
