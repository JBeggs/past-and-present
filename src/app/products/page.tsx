import Link from 'next/link'
import { serverEcommerceApi } from '@/lib/api-server'
import { Product } from '@/lib/types'
import { Clock, Sparkles, Filter, Search } from 'lucide-react'

interface ProductsPageProps {
  searchParams: Promise<{ condition?: string; category?: string; search?: string; page?: string }>
}

async function getProducts(params: { condition?: string; category?: string; search?: string; page?: string }) {
  try {
    const productsData = await serverEcommerceApi.products.list({
      is_active: true,
      category: params.category,
      search: params.search,
      page: params.page ? parseInt(params.page) : 1,
    })

    let products = Array.isArray(productsData) ? productsData : (productsData as any)?.results || []
    
    // Filter by condition if specified
    if (params.condition === 'vintage') {
      products = products.filter((p: Product) => p.is_vintage)
    } else if (params.condition === 'new') {
      products = products.filter((p: Product) => !p.is_vintage)
    }

    return products
  } catch (error) {
    console.error('Error fetching products:', error)
    return []
  }
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams
  const products = await getProducts(params)
  const isVintage = params.condition === 'vintage'
  const isNew = params.condition === 'new'

  return (
    <div className="min-h-screen bg-vintage-background">
      {/* Page Header */}
      <section className={`py-12 ${isVintage ? 'bg-vintage-primary' : isNew ? 'bg-modern-primary' : 'bg-gradient-to-r from-vintage-primary to-modern-primary'} text-white`}>
        <div className="container-wide">
          <h1 className="text-3xl md:text-4xl font-bold font-playfair mb-2">
            {isVintage ? 'Vintage Treasures' : isNew ? 'New Arrivals' : 'All Products'}
          </h1>
          <p className="text-lg opacity-90">
            {isVintage 
              ? 'Unique second-hand finds with character and history'
              : isNew 
                ? 'Fresh finds and modern essentials'
                : 'Browse our complete collection of vintage and new items'}
          </p>
        </div>
      </section>

      {/* Filters */}
      <section className="py-6 bg-white border-b border-gray-200">
        <div className="container-wide">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-text-muted" />
              <span className="font-medium">Filter:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link
                href="/products"
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  !params.condition ? 'bg-vintage-primary text-white' : 'bg-gray-100 text-text hover:bg-gray-200'
                }`}
              >
                All
              </Link>
              <Link
                href="/products?condition=vintage"
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  isVintage ? 'bg-vintage-primary text-white' : 'bg-gray-100 text-text hover:bg-gray-200'
                }`}
              >
                <Clock className="w-4 h-4 inline mr-1" />
                Vintage
              </Link>
              <Link
                href="/products?condition=new"
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  isNew ? 'bg-modern-primary text-white' : 'bg-gray-100 text-text hover:bg-gray-200'
                }`}
              >
                <Sparkles className="w-4 h-4 inline mr-1" />
                New
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-12">
        <div className="container-wide">
          {products.length > 0 ? (
            <div className="product-grid">
              {products.map((product: Product) => (
                <Link
                  key={product.id}
                  href={`/products/${product.slug}`}
                  className={`${product.is_vintage ? 'product-card-vintage' : 'product-card-modern'} group`}
                >
                  <div className="relative overflow-hidden">
                    {product.featured_image?.file_url ? (
                      <img
                        src={product.featured_image.file_url}
                        alt={product.name}
                        className="product-image group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="product-image bg-gray-100 flex items-center justify-center">
                        {product.is_vintage ? (
                          <Clock className="w-12 h-12 text-vintage-primary/30" />
                        ) : (
                          <Sparkles className="w-12 h-12 text-modern-primary/30" />
                        )}
                      </div>
                    )}
                    <span className={`tag ${product.is_vintage ? 'tag-vintage' : 'tag-new'} absolute top-2 left-2`}>
                      {product.is_vintage ? 'Vintage' : 'New'}
                    </span>
                    {product.compare_at_price && product.compare_at_price > product.price && (
                      <span className="tag tag-sale absolute top-2 right-2">Sale</span>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className={`font-semibold text-text group-hover:${product.is_vintage ? 'text-vintage-primary' : 'text-modern-primary'} transition-colors`}>
                      {product.name}
                    </h3>
                    {product.description && (
                      <p className="text-sm text-text-muted mt-1 line-clamp-2">{product.description}</p>
                    )}
                    <div className="mt-3 flex items-center gap-2">
                      <span className={`price ${product.is_vintage ? '' : 'text-modern-primary'}`}>
                        R{product.price.toFixed(2)}
                      </span>
                      {product.compare_at_price && product.compare_at_price > product.price && (
                        <span className="price-original">R{product.compare_at_price.toFixed(2)}</span>
                      )}
                    </div>
                    {product.quantity <= 5 && product.quantity > 0 && (
                      <p className="text-sm text-vintage-accent mt-2">Only {product.quantity} left!</p>
                    )}
                    {product.quantity === 0 && (
                      <p className="text-sm text-text-muted mt-2">Out of stock</p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <Search className="w-16 h-16 mx-auto mb-4 text-text-muted opacity-30" />
              <h2 className="text-xl font-semibold text-text mb-2">No products found</h2>
              <p className="text-text-muted mb-6">
                {params.search 
                  ? `No results for "${params.search}"`
                  : 'Check back soon for new items!'}
              </p>
              <Link href="/products" className="btn btn-primary">
                View All Products
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
