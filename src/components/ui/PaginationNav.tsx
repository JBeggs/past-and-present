'use client'

import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface PaginationNavProps {
  page: number
  totalPages: number
  basePath: string
  searchParams: Record<string, string>
  total?: number
}

function buildUrl(basePath: string, params: Record<string, string>, page: number): string {
  const all = { ...params, page: String(page) }
  const qs = Object.entries(all)
    .filter(([, v]) => v != null && v !== '')
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join('&')
  return qs ? `${basePath}?${qs}` : basePath
}

export default function PaginationNav({
  page,
  totalPages,
  basePath,
  searchParams,
  total,
}: PaginationNavProps) {
  if (totalPages <= 1) return null

  const prevPage = page > 1 ? page - 1 : null
  const nextPage = page < totalPages ? page + 1 : null

  return (
    <nav
      className="flex flex-col sm:flex-row items-center justify-between gap-4 py-6"
      aria-label="Pagination"
    >
      <div className="text-sm text-text-muted order-2 sm:order-1">
        {total != null && (
          <span>
            Page {page} of {totalPages}
            {total > 0 && ` (${total} items)`}
          </span>
        )}
      </div>

      <div className="flex items-center gap-2 order-1 sm:order-2">
        {prevPage ? (
          <Link
            href={buildUrl(basePath, searchParams, prevPage)}
            className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center px-4 py-2 rounded-lg border border-gray-200 bg-white text-text hover:bg-gray-50 hover:border-vintage-primary/30 transition-colors"
            aria-label="Previous page"
          >
            <ChevronLeft className="w-5 h-5" />
          </Link>
        ) : (
          <span
            className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center px-4 py-2 rounded-lg border border-gray-100 bg-gray-50 text-text-muted cursor-not-allowed"
            aria-disabled
          >
            <ChevronLeft className="w-5 h-5" />
          </span>
        )}

        <div className="flex items-center gap-1">
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            let p: number
            if (totalPages <= 5) {
              p = i + 1
            } else if (page <= 3) {
              p = i + 1
            } else if (page >= totalPages - 2) {
              p = totalPages - 4 + i
            } else {
              p = page - 2 + i
            }
            const isActive = p === page
            return (
              <Link
                key={p}
                href={buildUrl(basePath, searchParams, p)}
                className={`min-h-[44px] min-w-[44px] inline-flex items-center justify-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-vintage-primary text-white border border-vintage-primary'
                    : 'border border-gray-200 bg-white text-text hover:bg-gray-50 hover:border-vintage-primary/30'
                }`}
                aria-label={`Page ${p}`}
                aria-current={isActive ? 'page' : undefined}
              >
                {p}
              </Link>
            )
          })}
        </div>

        {nextPage ? (
          <Link
            href={buildUrl(basePath, searchParams, nextPage)}
            className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center px-4 py-2 rounded-lg border border-gray-200 bg-white text-text hover:bg-gray-50 hover:border-vintage-primary/30 transition-colors"
            aria-label="Next page"
          >
            <ChevronRight className="w-5 h-5" />
          </Link>
        ) : (
          <span
            className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center px-4 py-2 rounded-lg border border-gray-100 bg-gray-50 text-text-muted cursor-not-allowed"
            aria-disabled
          >
            <ChevronRight className="w-5 h-5" />
          </span>
        )}
      </div>
    </nav>
  )
}
