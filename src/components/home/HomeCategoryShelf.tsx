'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { Package } from 'lucide-react'
import ProductCard from '@/components/products/ProductCard'
import { ecommerceApi } from '@/lib/api'
import { Product } from '@/lib/types'
import { categoryViewAllHref, homeCategoryProductListParams } from '@/lib/store-shelves'

type HomeCategoryShelfProps = {
  name: string
  slug: string
  index: number
}

function sortProductsByName(products: Product[]): Product[] {
  return [...products].sort((a, b) =>
    (a.name || '').localeCompare(b.name || '', undefined, { sensitivity: 'base' }),
  )
}

function parseProductList(response: unknown): Product[] {
  const raw = Array.isArray(response)
    ? response
    : (response as { data?: Product[]; results?: Product[] })?.data
      || (response as { results?: Product[] })?.results
      || []
  return sortProductsByName(
    raw.filter((p: Product) => p.status !== 'archived'),
  )
}

function ShelfSkeleton() {
  return (
    <div className="product-grid" aria-hidden>
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="rounded-lg border border-gray-100 bg-white overflow-hidden animate-pulse">
          <div className="aspect-square bg-gray-200" />
          <div className="p-4 space-y-2">
            <div className="h-4 bg-gray-200 rounded w-3/4" />
            <div className="h-3 bg-gray-100 rounded w-full" />
            <div className="h-5 bg-gray-200 rounded w-1/3 mt-4" />
          </div>
        </div>
      ))}
    </div>
  )
}

export default function HomeCategoryShelf({ name, slug, index }: HomeCategoryShelfProps) {
  const sectionRef = useRef<HTMLElement>(null)
  const [products, setProducts] = useState<Product[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    if (products !== null || loading || failed) return
    const el = sectionRef.current
    if (!el) return

    const loadProducts = () => {
      setLoading(true)
      ecommerceApi.products
        .list(homeCategoryProductListParams(slug))
        .then((response) => {
          setProducts(parseProductList(response))
        })
        .catch(() => {
          setFailed(true)
          setProducts([])
        })
        .finally(() => setLoading(false))
    }

    if (typeof IntersectionObserver === 'undefined') {
      loadProducts()
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return
        observer.disconnect()
        loadProducts()
      },
      { rootMargin: '240px 0px', threshold: 0.01 },
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [slug, products, loading, failed])

  if (products !== null && products.length === 0) return null

  return (
    <section
      ref={sectionRef}
      className={`py-16 content-auto ${index % 2 === 0 ? 'bg-zinc-100' : 'bg-emerald-50/80'}`}
    >
      <div className="container-wide">
        <div className="section-header">
          <div>
            <h2 className="section-title">{name}</h2>
            <p className="text-text-muted mt-1">Products in this category</p>
          </div>
          <Link href={categoryViewAllHref(slug)} className="btn btn-secondary">
            <Package className="w-4 h-4 mr-2" />
            View All
          </Link>
        </div>
        {products === null || loading ? (
          <ShelfSkeleton />
        ) : (
          <div className="product-grid">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} homeQuickView imageLoading="lazy" />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
