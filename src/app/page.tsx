import Link from 'next/link'
import { serverEcommerceApi, serverNewsApi } from '@/lib/api-server'
export const dynamic = 'force-dynamic'
import { Product, Article } from '@/lib/types'
import { ArrowRight, Sparkles, Clock, Rocket, Package, TimerReset, ShoppingBasket, Wrench } from 'lucide-react'
import ProductCard from '@/components/products/ProductCard'
import {
  CATEGORY_SHELF_EXCLUDE_TAGS,
  CONSUMABLES_CATEGORY_SLUG,
  HARDWARE_CATEGORY_SLUG,
  NEW_LISTING_EXCLUDED_CATEGORY_SLUGS,
  consumablesListingHref,
  hardwareListingHref,
} from '@/lib/store-shelves'

/** Stable A–Z by product name for home shelves (case-insensitive). */
function sortProductsByName(products: Product[]): Product[] {
  return [...products].sort((a, b) =>
    (a.name || '').localeCompare(b.name || '', undefined, { sensitivity: 'base' })
  )
}

async function getHomeData() {
  try {
    const [
      featuredRes,
      vintageRes,
      newRes,
      bundlesRes,
      timedRes,
      hardwareRes,
      consumablesRes,
      articlesData,
      futureArticlesData,
    ] = await Promise.all([
      serverEcommerceApi.products.list({
        is_active: true,
        featured: true,
        page_size: 100,
        ordering: 'name',
      }),
      serverEcommerceApi.products.list({
        is_active: true,
        exclude_featured: true,
        tags: 'vintage',
        page_size: 20,
        ordering: 'name',
      }),
      serverEcommerceApi.products.list({
        is_active: true,
        exclude_featured: true,
        exclude_category: NEW_LISTING_EXCLUDED_CATEGORY_SLUGS,
        exclude_bundles: 'true',
        page_size: 100,
        ordering: 'name',
      }),
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
      serverEcommerceApi.products.list({
        is_active: true,
        category: HARDWARE_CATEGORY_SLUG,
        exclude_tags: CATEGORY_SHELF_EXCLUDE_TAGS,
        exclude_bundles: 'true',
        page_size: 20,
        ordering: 'name',
      }),
      serverEcommerceApi.products.list({
        is_active: true,
        category: CONSUMABLES_CATEGORY_SLUG,
        exclude_tags: CATEGORY_SHELF_EXCLUDE_TAGS,
        exclude_bundles: 'true',
        page_size: 20,
        ordering: 'name',
      }),
      serverNewsApi.articles.list({ status: 'published' }),
      serverNewsApi.articles.list({ status: 'published', category__slug: 'future' }),
    ])

    const featuredRaw = Array.isArray(featuredRes) ? featuredRes : (featuredRes as any)?.data || (featuredRes as any)?.results || []
    const vintageRaw = Array.isArray(vintageRes) ? vintageRes : (vintageRes as any)?.data || (vintageRes as any)?.results || []
    const newRaw = Array.isArray(newRes) ? newRes : (newRes as any)?.data || (newRes as any)?.results || []
    const bundlesRaw = Array.isArray(bundlesRes) ? bundlesRes : (bundlesRes as any)?.data || (bundlesRes as any)?.results || []
    const timedRaw = Array.isArray(timedRes) ? timedRes : (timedRes as any)?.data || (timedRes as any)?.results || []
    const hardwareRaw = Array.isArray(hardwareRes)
      ? hardwareRes
      : (hardwareRes as any)?.data || (hardwareRes as any)?.results || []
    const consumablesRaw = Array.isArray(consumablesRes)
      ? consumablesRes
      : (consumablesRes as any)?.data || (consumablesRes as any)?.results || []
    const articles = Array.isArray(articlesData) ? articlesData : (articlesData as any)?.data || (articlesData as any)?.results || []
    const futureArticles = Array.isArray(futureArticlesData) ? futureArticlesData : (futureArticlesData as any)?.data || (futureArticlesData as any)?.results || []

    const featuredProducts = sortProductsByName(
      featuredRaw
        .filter((p: Product) => p.status !== 'archived')
        .map((p: Product) => ({
          ...p,
          is_vintage: Array.isArray(p.tags) && p.tags.some((t: string | { name: string }) => (typeof t === 'string' ? t : t.name) === 'vintage'),
        }))
    )

    const vintageProducts: Product[] = sortProductsByName(
      vintageRaw.filter((p: Product) => p.status !== 'archived').slice(0, 20)
    )

    const newNonVintage: Product[] = newRaw.filter((p: Product) => {
      if (p.status === 'archived') return false
      const tags = Array.isArray(p.tags) ? p.tags.map((t: string | { name: string }) => typeof t === 'string' ? t : t.name) : []
      return !tags.includes('vintage')
    })
    const newProducts: Product[] = sortProductsByName(newNonVintage).slice(0, 20)
    const bundlesProducts: Product[] = sortProductsByName(
      bundlesRaw.filter((p: Product) => p.status !== 'archived').slice(0, 20)
    )
    const timedProducts: Product[] = sortProductsByName(
      timedRaw.filter((p: Product) => p.status !== 'archived').slice(0, 20)
    )
    const hardwareProducts: Product[] = sortProductsByName(
      hardwareRaw.filter((p: Product) => p.status !== 'archived').slice(0, 20)
    )
    const consumablesProducts: Product[] = sortProductsByName(
      consumablesRaw.filter((p: Product) => p.status !== 'archived').slice(0, 20)
    )

    return {
      featuredProducts,
      vintageProducts,
      newProducts,
      bundlesProducts,
      timedProducts,
      hardwareProducts,
      consumablesProducts,
      latestArticles: articles.slice(0, 3),
      futureArticles: futureArticles.slice(0, 3),
    }
  } catch (error) {
    console.error('Error fetching home data:', error)
    return {
      featuredProducts: [],
      vintageProducts: [],
      newProducts: [],
      bundlesProducts: [],
      timedProducts: [],
      hardwareProducts: [],
      consumablesProducts: [],
      latestArticles: [],
      futureArticles: [],
    }
  }
}

export default async function HomePage() {
  const {
    featuredProducts,
    vintageProducts,
    newProducts,
    bundlesProducts,
    timedProducts,
    hardwareProducts,
    consumablesProducts,
    latestArticles,
    futureArticles,
  } = await getHomeData()

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-vintage-primary to-vintage-primary-dark text-white py-20">
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
              <Link href="/products?condition=new" className="btn bg-white text-vintage-primary hover:bg-gray-100">
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

      {/* Featured Section */}
      {featuredProducts.length > 0 && (
        <section className="py-16 bg-white">
          <div className="container-wide">
            <div className="section-header">
              <div>
                <h2 className="section-title">Featured Treasures</h2>
                <p className="text-text-muted mt-1">Our most special and unique items</p>
              </div>
              <Link href="/products" className="btn btn-secondary">
                View All <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </div>
            
            <div className="product-grid">
              {featuredProducts.map((product: Product) => (
                <ProductCard key={product.id} product={product} homeQuickView />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Bundles — always on home (after Featured); hardware / consumables / new rails exclude bundles */}
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
                When bundle products are published in the CRM, they will appear here. They stay out of New Arrivals,
                Hardware, and Consumables by design.
              </p>
              <Link href="/products?bundle_only=true" className="btn btn-secondary mt-6 inline-flex">
                Browse bundles
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Hardware: before consumables; same tag exclusions as consumables shelf */}
      {hardwareProducts.length > 0 && (
        <section className="py-16 bg-zinc-100">
          <div className="container-wide">
            <div className="section-header">
              <div>
                <h2 className="section-title">Hardware</h2>
                <p className="text-text-muted mt-1">
                  Tools and hardware in the hardware category (excludes bundles, vintage, new, and other tagged specials)
                </p>
              </div>
              <Link href={hardwareListingHref()} className="btn btn-secondary">
                <Wrench className="w-4 h-4 mr-2" />
                View All
              </Link>
            </div>
            <div className="product-grid">
              {hardwareProducts.map((product: Product) => (
                <ProductCard key={product.id} product={product} homeQuickView />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Consumables: category shelf excluding vintage / new / others tags */}
      {consumablesProducts.length > 0 && (
        <section className="py-16 bg-emerald-50/80">
          <div className="container-wide">
            <div className="section-header">
              <div>
                <h2 className="section-title">Consumables</h2>
                <p className="text-text-muted mt-1">
                  Everyday essentials in the consumables category (excludes bundles, vintage, new, and other tagged specials)
                </p>
              </div>
              <Link href={consumablesListingHref()} className="btn btn-secondary">
                <ShoppingBasket className="w-4 h-4 mr-2" />
                View All
              </Link>
            </div>
            <div className="product-grid">
              {consumablesProducts.map((product: Product) => (
                <ProductCard key={product.id} product={product} homeQuickView />
              ))}
            </div>
          </div>
        </section>
      )}

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

      {/* Vintage Section */}
      <section className="py-16 bg-vintage-background">
        <div className="container-wide">
          <div className="section-header">
            <div>
              <h2 className="section-title">Vintage Treasures</h2>
              <p className="text-text-muted mt-1">Unique second-hand finds with character</p>
            </div>
            <Link href="/products?condition=vintage" className="btn btn-primary">
              View All <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </div>
          
          {vintageProducts.length > 0 ? (
            <div className="product-grid">
              {vintageProducts.map((product: Product) => (
                <ProductCard key={product.id} product={product} homeQuickView />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-text-muted">
              <Clock className="w-16 h-16 mx-auto mb-4 opacity-30" />
              <p>Vintage items coming soon!</p>
            </div>
          )}
        </div>
      </section>

      {/* New Products Section */}
      <section className="py-16 bg-modern-background">
        <div className="container-wide">
          <div className="section-header-modern">
            <div>
              <h2 className="section-title">New Arrivals</h2>
              <p className="text-text-muted mt-1">Fresh finds and modern essentials</p>
            </div>
            <Link href="/products?condition=new" className="btn btn-modern">
              View All <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </div>
          
          {newProducts.length > 0 ? (
            <div className="product-grid">
              {newProducts.map((product: Product) => (
                <ProductCard key={product.id} product={product} homeQuickView />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-text-muted">
              <Sparkles className="w-16 h-16 mx-auto mb-4 opacity-30" />
              <p>New products coming soon!</p>
            </div>
          )}
        </div>
      </section>

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
