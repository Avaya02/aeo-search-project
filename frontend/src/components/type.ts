export interface Citation {
  title: string;
  url: string;
  description: string; // <-- Make sure this is added
}

export interface ApiResponse {
  answer: string;
  citations: Citation[];
}

// --- New type for chat history ---
export interface SearchResult {
  query: string;
  answer: string;
  citations: Citation[];
}