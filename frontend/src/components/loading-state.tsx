"use client"

export default function LoadingState() {
  return (
    <div className="text-center" role="status" aria-live="polite">
      <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-muted-foreground/30 border-b-primary" />
      <p className="mt-2 text-muted-foreground">Searching the web for answers...</p>
      <div className="mt-4 grid grid-cols-1 gap-2">
        <div className="h-3 w-5/6 animate-pulse rounded bg-muted" />
        <div className="h-3 w-4/6 animate-pulse rounded bg-muted" />
        <div className="h-3 w-3/6 animate-pulse rounded bg-muted" />
      </div>
    </div>
  )
}
