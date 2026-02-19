import Link from 'next/link'
import { serverEcommerceApi, serverNewsApi } from '@/lib/api-server'
export const dynamic = 'force-dynamic'
import { Product, Article } from '@/lib/types'
import { ArrowRight, Sparkles, Clock } from 'lucide-react'

function shuffleArray<T>(arr: T[]): T[] {
  const out = [...arr]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

async function getHomeData() {
  try {
    const [featuredRes, vintageRes, newRes, articlesData] = await Promise.all([
      serverEcommerceApi.products.list({
        is_active: true,
        featured: true,
        page_size: 100,
      }),
      serverEcommerceApi.products.list({
        is_active: true,
        exclude_featured: true,
        tags: 'vintage',
        page_size: 20,
        ordering: 'random',
      }),
      serverEcommerceApi.products.list({
        is_active: true,
        exclude_featured: true,
        page_size: 100,
      }),
      serverNewsApi.articles.list({ status: 'published' }),
    ])

    const featuredRaw = Array.isArray(featuredRes) ? featuredRes : (featuredRes as any)?.data || (featuredRes as any)?.results || []
    const vintageRaw = Array.isArray(vintageRes) ? vintageRes : (vintageRes as any)?.data || (vintageRes as any)?.results || []
    const newRaw = Array.isArray(newRes) ? newRes : (newRes as any)?.data || (newRes as any)?.results || []
    const articles = Array.isArray(articlesData) ? articlesData : (articlesData as any)?.data || (articlesData as any)?.results || []

    const featuredProducts = featuredRaw
      .filter((p: Product) => p.status !== 'archived')
      .map((p: Product) => ({
        ...p,
        is_vintage: Array.isArray(p.tags) && p.tags.some((t: string | { name: string }) => (typeof t === 'string' ? t : t.name) === 'vintage'),
      }))

    const vintageProducts: Product[] = vintageRaw
      .filter((p: Product) => p.status !== 'archived')
      .slice(0, 20)

    const newNonVintage: Product[] = newRaw.filter((p: Product) => {
      if (p.status === 'archived') return false
      const tags = Array.isArray(p.tags) ? p.tags.map((t: string | { name: string }) => typeof t === 'string' ? t : t.name) : []
      return !tags.includes('vintage')
    })
    const newProducts: Product[] = shuffleArray(newNonVintage).slice(0, 20)

    return {
      featuredProducts,
      vintageProducts,
      newProducts,
      latestArticles: articles.slice(0, 3),
    }
  } catch (error) {
    console.error('Error fetching home data:', error)
    return {
      featuredProducts: [],
      vintageProducts: [],
      newProducts: [],
      latestArticles: [],
    }
  }
}

export default async function HomePage() {
  const { featuredProducts, vintageProducts, newProducts, latestArticles } = await getHomeData()

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-vintage-primary to-vintage-primary-dark text-white py-20" data-cy="home-hero">
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
            </div>
          </div>
        </div>
      </section>

      {/* Featured Section */}
      {featuredProducts.length > 0 && (
        <section className="py-16 bg-white" data-cy="home-featured">
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
              {featuredProducts.map((product: any) => (
                <Link key={product.id} href={`/products/${product.slug}`} className={`group relative flex flex-col ${product.is_vintage ? 'product-card-vintage' : 'product-card-modern'}`} prefetch={false}>
                  <div className="relative overflow-hidden aspect-square">
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                        <Sparkles className="w-12 h-12 text-vintage-primary/30" />
                      </div>
                    )}
                    <span className="tag tag-featured absolute top-2 right-2 shadow-sm">Featured</span>
                    <span className={`tag absolute top-2 left-2 ${product.is_vintage ? 'tag-vintage' : 'tag-new'}`}>
                      {product.is_vintage ? 'Vintage' : 'New'}
                    </span>
                  </div>
                  <div className="p-4 flex-1 flex flex-col">
                    <h3 className="font-semibold text-text group-hover:text-vintage-primary transition-colors line-clamp-1">
                      {product.name}
                    </h3>
                    <p className="text-sm text-text-muted mt-1 line-clamp-2 flex-1">{product.description}</p>
                    <div className="mt-3 flex items-center justify-between pt-3 border-t border-gray-50">
                      <span className="price">R{Number(product.price).toFixed(2)}</span>
                      {product.compare_at_price && Number(product.compare_at_price) > Number(product.price) && (
                        <span className="price-original">R{Number(product.compare_at_price).toFixed(2)}</span>
                      )}
                    </div>
                  </div>
                </Link>
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
                <Link key={product.id} href={`/products/${product.slug}`} className="product-card-vintage group" prefetch={false}>
        <div className="relative overflow-hidden">
          {product.image ? (
            <img
              src={product.image}
              alt={product.name}
              loading="lazy"
              decoding="async"
              className="product-image group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="product-image bg-vintage-primary/10 flex items-center justify-center">
              <Clock className="w-12 h-12 text-vintage-primary/30" />
            </div>
          )}
          <span className="tag tag-vintage absolute top-2 left-2">Vintage</span>
        </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-text group-hover:text-vintage-primary transition-colors">
                      {product.name}
                    </h3>
                    <p className="text-sm text-text-muted mt-1 line-clamp-2">{product.description}</p>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="price">R{Number(product.price).toFixed(2)}</span>
                      {product.compare_at_price && Number(product.compare_at_price) > Number(product.price) && (
                        <span className="price-original">R{Number(product.compare_at_price).toFixed(2)}</span>
                      )}
                    </div>
                  </div>
                </Link>
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
                <Link key={product.id} href={`/products/${product.slug}`} className="product-card-modern group" prefetch={false}>
        <div className="relative overflow-hidden">
          {product.image ? (
            <img
              src={product.image}
              alt={product.name}
              loading="lazy"
              decoding="async"
              className="product-image group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="product-image bg-modern-primary/10 flex items-center justify-center">
              <Sparkles className="w-12 h-12 text-modern-primary/30" />
            </div>
          )}
          <span className="tag tag-new absolute top-2 left-2">New</span>
        </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-text group-hover:text-modern-primary transition-colors">
                      {product.name}
                    </h3>
                    <p className="text-sm text-text-muted mt-1 line-clamp-2">{product.description}</p>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="price text-modern-primary">R{Number(product.price).toFixed(2)}</span>
                      {product.compare_at_price && Number(product.compare_at_price) > Number(product.price) && (
                        <span className="price-original">R{Number(product.compare_at_price).toFixed(2)}</span>
                      )}
                    </div>
                  </div>
                </Link>
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

      {/* Articles Section */}
      {latestArticles.length > 0 && (
        <section className="py-16 bg-white" data-cy="home-articles">
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
