export default function Loading() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center bg-vintage-background">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-vintage-primary/30 border-t-vintage-primary rounded-full animate-spin" />
        <p className="text-text-muted text-sm">Loading...</p>
      </div>
    </div>
  )
}
