"use client"

import { useState} from "react";
import type { FormEvent } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { Search } from "lucide-react";

import AnimatedBackground from "./components/animated-background";
import AnswerCard from "./components/answer-card";
import HistorySidebar from "./components/history-sidebar";
import type { ApiResponse, Citation, SearchResult } from "./components/type";
import { cn } from "./lib/utils";

export default function App() {
  const [query, setQuery] = useState("");
  const [answer, setAnswer] = useState("");
  const [citations, setCitations] = useState<Citation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // --- New State for History and Sidebar ---
  const [history, setHistory] = useState<SearchResult[]>([]);
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const hasActivity = isLoading || !!answer || !!error;

  const handleSearch = async (e: FormEvent) => {
    e.preventDefault();
    if (!query.trim() || isLoading) return;

    setIsLoading(true);
    setError("");
    setAnswer("");
    setCitations([]);

    try {
      const response = await axios.post<ApiResponse>("http://localhost:5001/api/search", { query });
      const newResult = { query, ...response.data };
      setAnswer(newResult.answer);
      setCitations(newResult.citations);
      // Add the new search to the beginning of the history list
      setHistory(prev => [newResult, ...prev]);
    } catch (err) {
      setError("Failed to fetch results. Please try again.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  
  // --- Function to handle clicks from the history sidebar ---
  const handleHistoryClick = (result: SearchResult) => {
    setQuery(result.query);
    setAnswer(result.answer);
    setCitations(result.citations);
    setError('');
    setIsLoading(false);
    setSidebarOpen(false); // Close sidebar after selection
  };

  return (
    <main className="dark relative min-h-dvh bg-[#0A0A0A] text-neutral-200 font-sans">
      <AnimatedBackground />
      <HistorySidebar 
        history={history}
        onHistoryClick={handleHistoryClick}
        isOpen={isSidebarOpen}
        onToggle={() => setSidebarOpen(!isSidebarOpen)}
      />

      <section
        className={cn(
          "mx-auto max-w-2xl px-4 transition-all duration-500 ease-in-out",
          hasActivity ? "py-10 md:py-16 grid gap-8" : "min-h-dvh grid place-content-center gap-8 text-center",
        )}
      >
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-4xl md:text-5xl font-bold text-neutral-100">
            AEO Search Engine
          </h1>
          <p className="text-neutral-400 mt-2">
            Ask a question. Get a cited answer.
          </p>
        </motion.div>

        <motion.div 
          layout 
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="w-full"
        >
          <div className="border-neutral-800/70 shadow-lg backdrop-blur-md supports-[backdrop-filter]:bg-neutral-900/50 p-2 rounded-xl border">
            <form onSubmit={handleSearch} className="relative">
              <div className="relative">
                <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-neutral-500">
                  <Search className="size-4" />
                </span>
                <input
                  id="query"
                  name="query"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Show me the best running shoes for men..."
                  className="w-full pl-9 pr-24 py-2.5 bg-transparent border-none focus:ring-0 focus:outline-none text-base rounded-lg placeholder:text-neutral-500"
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  disabled={isLoading || !query.trim()}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 h-8 px-4 rounded-lg bg-neutral-100 text-black hover:bg-white disabled:bg-neutral-800 disabled:text-neutral-500 transition-colors font-semibold text-sm"
                >
                  {isLoading ? "Asking..." : "Ask"}
                </button>
              </div>
            </form>
          </div>
        </motion.div>

        <div className="space-y-6" aria-live="polite">
          {isLoading && (
            <div className="flex justify-center items-center gap-2 text-neutral-400">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-neutral-300"></div>
                <span>Searching...</span>
            </div>
          )}

          {error && (
            <div className="bg-red-900/30 text-red-300 p-3 rounded-md border border-red-800/50 text-sm text-center">
              <p>{error}</p>
            </div>
          )}

          {!isLoading && answer && <AnswerCard answer={answer} citations={citations} />}
        </div>
      </section>
    </main>
  );
}