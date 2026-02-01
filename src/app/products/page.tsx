import Link from 'next/link'
import { serverEcommerceApi } from '@/lib/api-server'
import { Product } from '@/lib/types'
import { Clock, Sparkles, Filter, Search } from 'lucide-react'
import AdminActions from '@/components/products/AdminActions'
import ProductCard from '@/components/products/ProductCard'

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

    let products = Array.isArray(productsData) ? productsData : (productsData as any)?.data || (productsData as any)?.results || []
    
    // Filter by condition if specified
    if (params.condition === 'vintage') {
      products = products.filter((p: Product) => {
        const tags = Array.isArray(p.tags) ? p.tags.map(t => typeof t === 'string' ? t : t.name) : []
        return tags.includes('vintage')
      })
    } else if (params.condition === 'new') {
      products = products.filter((p: Product) => {
        const tags = Array.isArray(p.tags) ? p.tags.map(t => typeof t === 'string' ? t : t.name) : []
        return !tags.includes('vintage')
      })
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
      {/* Admin Management Actions */}
      <AdminActions />

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
                <ProductCard key={product.id} product={product} />
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
