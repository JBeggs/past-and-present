import type { Metadata } from 'next'
import Link from 'next/link'
import { serverEcommerceApi, serverNewsApi } from '@/lib/api-server'
import { mergeArticleListParams, isArticleAllowedForStorefront } from '@/lib/article-author'
import {
  filterArticlesByDisplaySettings,
  getArticleDisplaySettings,
} from '@/lib/article-display-settings'
import { getShareImage } from '@/lib/share-image'
import { Product, Article } from '@/lib/types'
import { ArrowRight, Sparkles, Clock, Rocket, Package, TimerReset } from 'lucide-react'
import ProductCard from '@/components/products/ProductCard'
import PageHero from '@/components/hero/PageHero'
import { categoryViewAllHref, homeCategoryProductListParams } from '@/lib/store-shelves'

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

export type HomeCategoryShelf = {
  name: string
  slug: string
  products: Product[]
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
        page_size: 20,
        bundle_only: 'true',
        ordering: 'name',
      }),
      serverEcommerceApi.products.list({
        is_active: true,
        page_size: 20,
        timed_only: 'true',
        ordering: 'name',
      }),
      serverNewsApi.articles.list(mergeArticleListParams({ status: 'published' })),
      serverNewsApi.articles.list(
        mergeArticleListParams({ status: 'published', category__slug: 'future' }),
      ),
    ])

    const SHELF_LABELS = ['bundles', 'timed', 'articles', 'futureArticles'] as const

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

    const [bundlesRes, timedRes, articlesData, futureArticlesData] = settled.map((_, i) => valueOrEmpty(i))

    const bundlesRaw = Array.isArray(bundlesRes) ? bundlesRes : (bundlesRes as any)?.data || (bundlesRes as any)?.results || []
    const timedRaw = Array.isArray(timedRes) ? timedRes : (timedRes as any)?.data || (timedRes as any)?.results || []
    const articlesRaw = Array.isArray(articlesData) ? articlesData : (articlesData as any)?.data || (articlesData as any)?.results || []
    const futureArticlesRaw = Array.isArray(futureArticlesData)
      ? futureArticlesData
      : (futureArticlesData as any)?.data || (futureArticlesData as any)?.results || []
    const articles = articlesRaw.filter(isArticleAllowedForStorefront)
    const futureArticles = futureArticlesRaw.filter(isArticleAllowedForStorefront)
    const latestArticles = displaySettings.homeEnabled
      ? filterArticlesByDisplaySettings(articles as Article[], displaySettings, 'home')
      : []

    const bundlesProducts: Product[] = sortProductsByName(
      bundlesRaw.filter((p: Product) => p.status !== 'archived').slice(0, 20)
    )
    const timedProducts: Product[] = sortProductsByName(
      timedRaw.filter((p: Product) => p.status !== 'archived').slice(0, 20)
    )

    let categoryShelves: HomeCategoryShelf[] = []
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
      const categoryRows = sortedCategories.filter((c) => {
        const slug = String(c.slug).trim().toLowerCase()
        if (seenCategorySlugs.has(slug)) return false
        seenCategorySlugs.add(slug)
        return true
      })

      const catSettled = await Promise.allSettled(
        categoryRows.map((c) =>
          serverEcommerceApi.products.list(homeCategoryProductListParams(String(c.slug).trim())),
        ),
      )

      const catFailures = catSettled
        .map((s, i) =>
          s.status === 'rejected'
            ? { shelf: `category:${String(categoryRows[i]?.slug)}`, reason: (s as PromiseRejectedResult).reason }
            : null,
        )
        .filter(Boolean)
      if (catFailures.length) {
        console.error('[home] some category shelf fetches failed; rendering remaining category shelves', catFailures)
      }

      categoryShelves = categoryRows
        .map((cat, i) => {
          const res = catSettled[i]
          if (res.status !== 'fulfilled') return null
          const val = (res as PromiseFulfilledResult<unknown>).value
          const raw = Array.isArray(val) ? val : (val as any)?.data || (val as any)?.results || []
          const products = sortProductsByName(
            raw.filter((p: Product) => p.status !== 'archived').slice(0, 20),
          )
          if (products.length === 0) return null
          return {
            name: String(cat.name).trim(),
            slug: String(cat.slug).trim(),
            products,
          }
        })
        .filter((s): s is HomeCategoryShelf => s != null)
    } catch (catErr) {
      console.error('[home] categories or dynamic shelves failed', catErr)
    }

    return {
      bundlesProducts,
      timedProducts,
      categoryShelves,
      latestArticles,
      futureArticles: futureArticles.slice(0, 3),
    }
  } catch (error) {
    console.error('Error fetching home data:', error)
    return {
      bundlesProducts: [],
      timedProducts: [],
      categoryShelves: [],
      latestArticles: [],
      futureArticles: [],
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
            <Link href="/products?condition=vintage" className="btn bg-modern-accent text-modern-primary hover:bg-modern-accent-dark">
              <Clock className="w-5 h-5 mr-2" />
              Shop Vintage
            </Link>
            <Link href="/products?category=new-arrivals" className="btn bg-white text-vintage-primary hover:bg-gray-100">
              <Sparkles className="w-5 h-5 mr-2" />
              Shop New
            </Link>
            <Link href="/future" className="btn bg-amber-500/90 text-white hover:bg-amber-600">
              <Rocket className="w-5 h-5 mr-2" />
              Future Plans
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
    futureArticles,
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
                <ProductCard key={product.id} product={product} homeQuickView />
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

      {/* Category shelves — A–Z by category name (then slug); only categories with at least one product */}
      {categoryShelves.map((shelf, index) => (
        <section
          key={shelf.slug}
          className={`py-16 ${index % 2 === 0 ? 'bg-zinc-100' : 'bg-emerald-50/80'}`}
        >
          <div className="container-wide">
            <div className="section-header">
              <div>
                <h2 className="section-title">{shelf.name}</h2>
                <p className="text-text-muted mt-1">Products in this category</p>
              </div>
              <Link href={categoryViewAllHref(shelf.slug)} className="btn btn-secondary">
                <Package className="w-4 h-4 mr-2" />
                View All
              </Link>
            </div>
            <div className="product-grid">
              {shelf.products.map((product: Product) => (
                <ProductCard key={product.id} product={product} homeQuickView />
              ))}
            </div>
          </div>
        </section>
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
                <ProductCard key={product.id} product={product} homeQuickView />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Future Plans Section */}
      {futureArticles.length > 0 && (
        <section className="py-16 bg-amber-50/50">
          <div className="container-wide">
            <div className="section-header-modern">
              <div>
                <h2 className="section-title">Future Plans</h2>
                <p className="text-text-muted mt-1">IoT development, projects to build, camera setups, home garden monitoring</p>
              </div>
              <Link href="/future" className="btn btn-modern">
                View All <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </div>
            
            <div className="article-grid">
              {futureArticles.map((article: Article) => (
                <Link key={article.id} href={`/articles/${article.slug}`} className="card group">
                  {article.featured_media?.file_url && (
                    <img
                      src={article.featured_media.file_url}
                      alt={article.title}
                      className="w-full h-48 object-cover rounded-t-lg"
                    />
                  )}
                  <div className="p-4">
                    <h3 className="font-semibold text-text group-hover:text-modern-primary transition-colors">
                      {article.title}
                    </h3>
                    {article.excerpt && (
                      <p className="text-sm text-text-muted mt-2 line-clamp-2">{article.excerpt}</p>
                    )}
                    <div className="mt-3 text-sm text-text-muted">
                      {article.published_at && new Date(article.published_at).toLocaleDateString()}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Articles Section */}
      {latestArticles.length > 0 && (
        <section className="py-16 bg-white">
          <div className="container-wide">
            <div className="section-header">
              <div>
                <h2 className="section-title">Stories & Inspiration</h2>
                <p className="text-text-muted mt-1">Tips, guides, and behind-the-scenes</p>
              </div>
              <Link href="/articles" className="btn btn-secondary">
                Read More <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </div>
            
            <div className="article-grid">
              {latestArticles.map((article: Article) => (
                <Link key={article.id} href={`/articles/${article.slug}`} className="card group">
                  {article.featured_media?.file_url && (
                    <img
                      src={article.featured_media.file_url}
                      alt={article.title}
                      className="w-full h-48 object-cover rounded-t-lg"
                    />
                  )}
                  <div className="p-4">
                    <h3 className="font-semibold text-text group-hover:text-vintage-primary transition-colors">
                      {article.title}
                    </h3>
                    {article.excerpt && (
                      <p className="text-sm text-text-muted mt-2 line-clamp-2">{article.excerpt}</p>
                    )}
                    <div className="mt-3 text-sm text-text-muted">
                      {article.published_at && new Date(article.published_at).toLocaleDateString()}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

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
