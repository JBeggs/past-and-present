import Link from 'next/link'
import { serverEcommerceApi, serverNewsApi } from '@/lib/api-server'
import { Product, Article } from '@/lib/types'
import { ArrowRight, Sparkles, Clock } from 'lucide-react'

async function getHomeData() {
  try {
    const [productsData, articlesData] = await Promise.all([
      serverEcommerceApi.products.list({ is_active: true }),
      serverNewsApi.articles.list({ status: 'published' }),
    ])

    const products = Array.isArray(productsData) ? productsData : (productsData as any)?.results || []
    const articles = Array.isArray(articlesData) ? articlesData : (articlesData as any)?.results || []

    return {
      featuredProducts: products.slice(0, 8),
      vintageProducts: products.filter((p: Product) => p.is_vintage).slice(0, 4),
      newProducts: products.filter((p: Product) => !p.is_vintage).slice(0, 4),
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
            </div>
          </div>
        </div>
      </section>

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
                <Link key={product.id} href={`/products/${product.slug}`} className="product-card-vintage group">
                  <div className="relative overflow-hidden">
                    {product.featured_image?.file_url ? (
                      <img
                        src={product.featured_image.file_url}
                        alt={product.name}
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
                      <span className="price">R{product.price.toFixed(2)}</span>
                      {product.compare_at_price && product.compare_at_price > product.price && (
                        <span className="price-original">R{product.compare_at_price.toFixed(2)}</span>
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
                <Link key={product.id} href={`/products/${product.slug}`} className="product-card-modern group">
                  <div className="relative overflow-hidden">
                    {product.featured_image?.file_url ? (
                      <img
                        src={product.featured_image.file_url}
                        alt={product.name}
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
                      <span className="price text-modern-primary">R{product.price.toFixed(2)}</span>
                      {product.compare_at_price && product.compare_at_price > product.price && (
                        <span className="price-original">R{product.compare_at_price.toFixed(2)}</span>
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
