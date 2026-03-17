import Link from 'next/link'
import { serverEcommerceApi } from '@/lib/api-server'
export const dynamic = 'force-dynamic'
import { Product } from '@/lib/types'
import { Clock, Sparkles, Filter, Search, Star, Package, TimerReset, Truck } from 'lucide-react'
import { Suspense } from 'react'
import ProductsSortSelect from '@/components/products/ProductsSortSelect'
import AdminActions from '@/components/products/AdminActions'
import ProductCard from '@/components/products/ProductCard'
import PaginationNav from '@/components/ui/PaginationNav'

interface ProductsPageProps {
  searchParams: Promise<{
    condition?: string
    category?: string
    search?: string
    page?: string
    featured?: string
    sort?: string
    bundle_only?: string
    timed_only?: string
    supplier_slug?: string
    delivery_group?: string
  }>
}

async function getProducts(params: {
  condition?: string
  category?: string
  search?: string
  page?: string
  featured?: string
  sort?: string
  bundle_only?: string
  timed_only?: string
  supplier_slug?: string
  delivery_group?: string
}) {
  try {
    const response = await serverEcommerceApi.products.list({
      is_active: true,
      category: params.category,
      search: params.search,
      condition: params.condition,
      featured: params.featured === 'true' ? true : undefined,
      page: params.page ? parseInt(params.page) : 1,
      page_size: 24,
      ordering: params.sort || undefined,
      bundle_only: params.bundle_only === 'true' ? 'true' : undefined,
      timed_only: params.timed_only === 'true' ? 'true' : undefined,
      supplier_slug: params.supplier_slug || undefined,
    })

    const raw = Array.isArray(response) ? response : (response as any)?.data || (response as any)?.results || []
    const products = raw
      .filter((p: Product) => p.status !== 'archived')
      .filter((p: any) => {
        if (!params.supplier_slug) return true
        return String(p.supplier_slug || '').toLowerCase() === params.supplier_slug.toLowerCase()
      })
    const pagination = (response as any)?.pagination

    return {
      products,
      pagination: pagination
        ? {
            page: pagination.page ?? 1,
            totalPages: pagination.totalPages ?? 1,
            total: pagination.total ?? products.length,
          }
        : { page: 1, totalPages: 1, total: products.length },
    }
  } catch (error) {
    console.error('Error fetching products:', error)
    return { products: [], pagination: { page: 1, totalPages: 1, total: 0 } }
  }
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams
  const { products, pagination } = await getProducts(params)
  const isVintage = params.condition === 'vintage'
  const isNew = params.condition === 'new'
  const isFeatured = params.featured === 'true'
  const isBundles = params.bundle_only === 'true'
  const isTimed = params.timed_only === 'true'
  const isSupplierGroup = !!params.supplier_slug

  const searchParamsForNav: Record<string, string> = {}
  if (params.condition) searchParamsForNav.condition = params.condition
  if (params.category) searchParamsForNav.category = params.category
  if (params.search) searchParamsForNav.search = params.search
  if (params.featured) searchParamsForNav.featured = params.featured
  if (params.sort) searchParamsForNav.sort = params.sort
  if (params.bundle_only) searchParamsForNav.bundle_only = params.bundle_only
  if (params.timed_only) searchParamsForNav.timed_only = params.timed_only
  if (params.supplier_slug) searchParamsForNav.supplier_slug = params.supplier_slug
  if (params.delivery_group) searchParamsForNav.delivery_group = params.delivery_group

  const title = isSupplierGroup
    ? 'Delivery Group'
    : isBundles
      ? 'Bundles'
      : isTimed
        ? 'Timed Products'
        : isVintage
          ? 'Vintage Treasures'
          : isNew
            ? 'New Arrivals'
            : isFeatured
              ? 'Featured Products'
              : 'All Products'

  const subtitle = isSupplierGroup
    ? 'Products grouped together by supplier delivery rules.'
    : isBundles
      ? 'Curated bundles with bundled buying rules.'
      : isTimed
        ? 'Limited-time products with expiry countdowns.'
        : isVintage
          ? 'Unique second-hand finds with character and history'
          : isNew
            ? 'Fresh finds and modern essentials'
            : isFeatured
              ? 'Hand-picked favorites and standout items'
              : 'Browse our complete collection of products'

  const makeHref = (overrides: Record<string, string | null>) => {
    const query = new URLSearchParams()
    const base = {
      condition: params.condition || null,
      category: params.category || null,
      search: params.search || null,
      featured: params.featured || null,
      sort: params.sort || null,
      bundle_only: params.bundle_only || null,
      timed_only: params.timed_only || null,
      supplier_slug: params.supplier_slug || null,
      delivery_group: params.delivery_group || null,
    }
    Object.entries({ ...base, ...overrides }).forEach(([key, value]) => {
      if (value) query.set(key, value)
    })
    const qs = query.toString()
    return qs ? `/products?${qs}` : '/products'
  }

  return (
    <div className="min-h-screen bg-vintage-background" data-cy="products-section">
      {/* Admin Management Actions */}
      <AdminActions />

      {/* Page Header */}
      <section className={`py-12 ${isBundles ? 'bg-blue-700' : isTimed ? 'bg-amber-600' : isVintage ? 'bg-vintage-primary' : isNew ? 'bg-modern-primary' : isFeatured ? 'bg-purple-600' : isSupplierGroup ? 'bg-slate-700' : 'bg-gradient-to-r from-vintage-primary to-modern-primary'} text-white`}>
        <div className="container-wide">
          <h1 className="text-3xl md:text-4xl font-bold font-playfair mb-2">
            {title}
          </h1>
          <p className="text-lg opacity-90">
            {subtitle}
          </p>
        </div>
      </section>

      {/* Search & Filters */}
      <section className="py-6 bg-white border-b border-gray-200">
        <div className="container-wide">
          <div className="flex flex-col gap-4">
            {/* Search and Sort */}
            <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
              <form
                method="get"
                action="/products"
                className="relative max-w-md flex-1"
              >
                {params.condition && <input type="hidden" name="condition" value={params.condition} />}
                {params.category && <input type="hidden" name="category" value={params.category} />}
                {params.featured && <input type="hidden" name="featured" value={params.featured} />}
                {params.sort && <input type="hidden" name="sort" value={params.sort} />}
                {params.bundle_only && <input type="hidden" name="bundle_only" value={params.bundle_only} />}
                {params.timed_only && <input type="hidden" name="timed_only" value={params.timed_only} />}
                {params.supplier_slug && <input type="hidden" name="supplier_slug" value={params.supplier_slug} />}
                {params.delivery_group && <input type="hidden" name="delivery_group" value={params.delivery_group} />}
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                <input
                  type="search"
                  name="search"
                  placeholder="Search by name or SKU..."
                  defaultValue={params.search}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-vintage-primary focus:border-vintage-primary text-text"
                />
              </form>

              <Suspense fallback={<div className="h-10 w-32 bg-gray-100 rounded-lg animate-pulse" />}>
                <ProductsSortSelect currentSort={params.sort || ''} />
              </Suspense>
            </div>

            {/* Filter buttons */}
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-text-muted" />
                <span className="font-medium">Filter:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                <Link
                  href={makeHref({
                    condition: null,
                    category: null,
                    featured: null,
                    bundle_only: null,
                    timed_only: null,
                    supplier_slug: null,
                    delivery_group: null,
                  })}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-1 ${
                    !params.condition && !params.bundle_only && !params.timed_only && !params.supplier_slug ? 'bg-vintage-primary text-white' : 'bg-gray-100 text-text hover:bg-gray-200'
                  }`}
                >
                  All
                </Link>
                <Link
                  href={makeHref({ condition: 'vintage', bundle_only: null, timed_only: null, supplier_slug: null, delivery_group: null })}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-1 ${
                    isVintage ? 'bg-vintage-primary text-white' : 'bg-gray-100 text-text hover:bg-gray-200'
                  }`}
                >
                  <Clock className="w-4 h-4" />
                  Vintage
                </Link>
                <Link
                  href={makeHref({ condition: 'new', bundle_only: null, timed_only: null, supplier_slug: null, delivery_group: null })}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-1 ${
                    isNew ? 'bg-modern-primary text-white' : 'bg-gray-100 text-text hover:bg-gray-200'
                  }`}
                >
                  <Sparkles className="w-4 h-4" />
                  New
                </Link>
                <Link
                  href={makeHref({ bundle_only: 'true', timed_only: null, condition: null, supplier_slug: null, delivery_group: null })}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-1 ${
                    isBundles ? 'bg-blue-700 text-white' : 'bg-gray-100 text-text hover:bg-gray-200'
                  }`}
                >
                  <Package className="w-4 h-4" />
                  Bundles
                </Link>
                <Link
                  href={makeHref({ timed_only: 'true', bundle_only: null, condition: null, supplier_slug: null, delivery_group: null })}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-1 ${
                    isTimed ? 'bg-amber-600 text-white' : 'bg-gray-100 text-text hover:bg-gray-200'
                  }`}
                >
                  <TimerReset className="w-4 h-4" />
                  Timed
                </Link>
                <Link
                  href={params.featured === 'true'
                    ? makeHref({ featured: null })
                    : makeHref({ featured: 'true', bundle_only: null, timed_only: null, supplier_slug: null, delivery_group: null })
                  }
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-1 ${
                    isFeatured ? 'bg-purple-600 text-white' : 'bg-gray-100 text-text hover:bg-gray-200'
                  }`}
                >
                  <Star className="w-4 h-4" />
                  Featured
                </Link>
                {isSupplierGroup && (
                  <span className="px-4 py-2 rounded-full text-sm font-medium bg-slate-700 text-white flex items-center gap-1">
                    <Truck className="w-4 h-4" />
                    {params.supplier_slug}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-12">
        <div className="container-wide">
          {products.length > 0 ? (
            <>
              <div className="product-grid" data-cy="products-grid">
                {products.map((product: Product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
              <PaginationNav
                page={pagination.page}
                totalPages={pagination.totalPages}
                total={pagination.total}
                basePath="/products"
                searchParams={searchParamsForNav}
              />
            </>
          ) : (
            <div className="text-center py-16" data-cy="products-empty">
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
