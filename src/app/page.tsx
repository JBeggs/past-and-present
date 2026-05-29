import type { Metadata } from 'next'
import Link from 'next/link'
import { serverEcommerceApi, listAllPublishedArticles } from '@/lib/api-server'
import {
  filterArticlesByDisplaySettings,
  getArticleDisplaySettings,
} from '@/lib/article-display-settings'
import HomeArticlesSection from '@/components/home/HomeArticlesSection'
import HomeCategoryShelf from '@/components/home/HomeCategoryShelf'
import { getShareImage } from '@/lib/share-image'
import { Product, Article } from '@/lib/types'
import { ArrowRight, Sparkles, Package, TimerReset } from 'lucide-react'
import ProductCard from '@/components/products/ProductCard'
import PageHero from '@/components/hero/PageHero'
import { HOME_SHELF_PAGE_SIZE } from '@/lib/store-shelves'

export type HomeCategoryRow = {
  name: string
  slug: string
}

export const dynamic = 'force-dynamic'

export async function generateMetadata(): Promise<Metadata> {
  const image = await getShareImage('home')
  return {
    openGraph: { images: [{ url: image }] },
    twitter: { card: 'summary_large_image', images: [image] },
  }
}

/** Stable A–Z by product name for home shelves (case-insensitive). */
function sortProductsByName(products: Product[]): Product[] {
  return [...products].sort((a, b) =>
    (a.name || '').localeCompare(b.name || '', undefined, { sensitivity: 'base' })
  )
}

export type HomeCategoryShelf = HomeCategoryRow & {
  products: Product[]
}

async function getHomeCategoryRows(): Promise<HomeCategoryRow[]> {
  try {
    const catRes = await serverEcommerceApi.categories.list()
    const catRaw = Array.isArray(catRes) ? catRes : (catRes as any)?.results || (catRes as any)?.data || []
    const sortedCategories = (catRaw as { name?: string; slug?: string }[])
      .filter((c) => String(c?.name || '').trim() && String(c?.slug || '').trim())
      .sort((a, b) => {
        const byName = String(a.name).localeCompare(String(b.name), undefined, { sensitivity: 'base' })
        if (byName !== 0) return byName
        return String(a.slug || '').localeCompare(String(b.slug || ''), undefined, { sensitivity: 'base' })
      })
    const seenCategorySlugs = new Set<string>()
    return sortedCategories
      .filter((c) => {
        const slug = String(c.slug).trim().toLowerCase()
        if (seenCategorySlugs.has(slug)) return false
        seenCategorySlugs.add(slug)
        return true
      })
      .map((c) => ({
        name: String(c.name).trim(),
        slug: String(c.slug).trim(),
      }))
  } catch (catErr) {
    console.error('[home] category list failed', catErr)
    return []
  }
}

async function getHomeData(displaySettings: Awaited<ReturnType<typeof getArticleDisplaySettings>>) {
  try {
    /**
     * One bad fetch should NOT zero every shelf.
     * `Promise.allSettled` lets each shelf fail independently; the rest still render.
     */
    const settled = await Promise.allSettled([
      serverEcommerceApi.products.list({
        is_active: true,
        page_size: HOME_SHELF_PAGE_SIZE,
        bundle_only: 'true',
        ordering: 'name',
      }),
      serverEcommerceApi.products.list({
        is_active: true,
        page_size: HOME_SHELF_PAGE_SIZE,
        timed_only: 'true',
        ordering: 'name',
      }),
      listAllPublishedArticles(),
      getHomeCategoryRows(),
    ])

    const SHELF_LABELS = ['bundles', 'timed', 'articles', 'categories'] as const

    const valueOrEmpty = (i: number): unknown =>
      settled[i].status === 'fulfilled'
        ? (settled[i] as PromiseFulfilledResult<unknown>).value
        : []

    const failures = settled
      .map((s, i) =>
        s.status === 'rejected'
          ? { shelf: SHELF_LABELS[i], reason: (s as PromiseRejectedResult).reason }
          : null,
      )
      .filter(Boolean)
    if (failures.length) {
      console.error('[home] some SSR fetches failed; rendering remaining shelves', failures)
    }

    const [bundlesRes, timedRes, articlesData, categoryRows] = settled.map((_, i) => valueOrEmpty(i))

    const bundlesRaw = Array.isArray(bundlesRes) ? bundlesRes : (bundlesRes as any)?.data || (bundlesRes as any)?.results || []
    const timedRaw = Array.isArray(timedRes) ? timedRes : (timedRes as any)?.data || (timedRes as any)?.results || []
    const articlesRaw = Array.isArray(articlesData) ? articlesData : []
    const articles = articlesRaw
    const latestArticles = displaySettings.homeEnabled
      ? filterArticlesByDisplaySettings(articles as Article[], displaySettings, 'home')
      : []

    const bundlesProducts: Product[] = sortProductsByName(
      bundlesRaw.filter((p: Product) => p.status !== 'archived').slice(0, HOME_SHELF_PAGE_SIZE)
    )
    const timedProducts: Product[] = sortProductsByName(
      timedRaw.filter((p: Product) => p.status !== 'archived').slice(0, HOME_SHELF_PAGE_SIZE)
    )

    const categoryShelves: HomeCategoryRow[] = Array.isArray(categoryRows)
      ? (categoryRows as HomeCategoryRow[])
      : []

    return {
      bundlesProducts,
      timedProducts,
      categoryShelves,
      latestArticles,
    }
  } catch (error) {
    console.error('Error fetching home data:', error)
    return {
      bundlesProducts: [],
      timedProducts: [],
      categoryShelves: [],
      latestArticles: [],
    }
  }
}

function DefaultHomeHero() {
  return (
    <section className="bg-gradient-to-br from-vintage-primary to-vintage-primary-dark text-white py-20 min-h-[24rem] sm:min-h-[28rem] md:min-h-[32rem] flex flex-col justify-center">
      <div className="container-wide">
        <div className="max-w-3xl">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-playfair mb-6">
            Where Past Meets Present
          </h1>
          <p className="text-xl text-green-100 mb-8">
            Discover unique vintage treasures alongside carefully curated modern finds.
            Every item tells a story, every purchase supports sustainable shopping.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link href="/products?category=new-arrivals" className="btn bg-white text-vintage-primary hover:bg-gray-100">
              <Sparkles className="w-5 h-5 mr-2" />
              Shop New
            </Link>
            <Link href="/products" className="btn btn-secondary">
              Shop All
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

export default async function HomePage() {
  const displaySettings = await getArticleDisplaySettings()
  const {
    bundlesProducts,
    timedProducts,
    categoryShelves,
    latestArticles,
  } = await getHomeData(displaySettings)

  return (
    <div className="min-h-screen">
      <PageHero pageSlug="home" fallback={<DefaultHomeHero />} />

      {/* Bundles — always on home; category shelves exclude bundles where configured */}
      <section className="py-16 bg-slate-50">
        <div className="container-wide">
          <div className="section-header">
            <div>
              <h2 className="section-title">Bundles</h2>
              <p className="text-text-muted mt-1">Curated product bundles for great value</p>
            </div>
            <Link href="/products?bundle_only=true" className="btn btn-secondary">
              <Package className="w-4 h-4 mr-2" />
              View All
            </Link>
          </div>
          {bundlesProducts.length > 0 ? (
            <div className="product-grid">
              {bundlesProducts.map((product: Product) => (
                <ProductCard key={product.id} product={product} homeQuickView imageLoading="lazy" />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-text-muted">
              <Package className="w-16 h-16 mx-auto mb-4 opacity-30" />
              <p className="font-medium text-text">No bundles to show yet</p>
              <p className="text-sm mt-2 max-w-md mx-auto">
                When bundle products are published in the CRM, they will appear here. Dedicated category shelves omit
                bundles where configured.
              </p>
              <Link href="/products?bundle_only=true" className="btn btn-secondary mt-6 inline-flex">
                Browse bundles
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Category shelves — loaded on scroll; one API call per visible category */}
      {categoryShelves.map((shelf, index) => (
        <HomeCategoryShelf key={shelf.slug} name={shelf.name} slug={shelf.slug} index={index} />
      ))}

      {/* Timed Section */}
      {timedProducts.length > 0 && (
        <section className="py-16 bg-amber-50/60">
          <div className="container-wide">
            <div className="section-header-modern">
              <div>
                <h2 className="section-title">Timed Products</h2>
                <p className="text-text-muted mt-1">Limited-time products with live expiry windows</p>
              </div>
              <Link href="/products?timed_only=true" className="btn btn-modern">
                <TimerReset className="w-4 h-4 mr-2" />
                View All
              </Link>
            </div>
            <div className="product-grid">
              {timedProducts.map((product: Product) => (
                <ProductCard key={product.id} product={product} homeQuickView imageLoading="lazy" />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Services Section */}
      <HomeArticlesSection articles={latestArticles} />

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-modern-primary to-modern-primary-dark text-white">
        <div className="container-wide text-center">
          <h2 className="text-3xl md:text-4xl font-bold font-playfair mb-4">
            Join Our Community
          </h2>
          <p className="text-lg text-blue-100 mb-8 max-w-2xl mx-auto">
            Be the first to know about new vintage finds, exclusive deals, and sustainable shopping tips.
          </p>
          <Link href="/register" className="btn btn-gold text-lg px-8 py-3">
            Create an Account
          </Link>
        </div>
      </section>
    </div>
  )
}
