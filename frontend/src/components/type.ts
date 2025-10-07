export interface Citation {
  title: string
  url: string
}

export interface ApiResponse {
  answer: string
  citations: Citation[]
}
