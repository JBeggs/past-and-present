import { Suspense } from 'react'
import { Loader2 } from 'lucide-react'

export default function InventoryLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-vintage-background flex items-center justify-center">
          <Loader2 className="w-10 h-10 animate-spin text-vintage-primary opacity-50" />
        </div>
      }
    >
      {children}
    </Suspense>
  )
}
