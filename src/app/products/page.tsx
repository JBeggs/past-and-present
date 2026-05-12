import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import PageHero from '@/components/hero/PageHero'
import { serverEcommerceApi } from '@/lib/api-server'
import { getShareImage } from '@/lib/share-image'
import { Product } from '@/lib/types'
import {
  Sparkles,
  Filter,
  Search,
  Star,
  Package,
  TimerReset,
  Truck,
} from 'lucide-react'
import { Suspense } from 'react'
import ProductsSortSelect from '@/components/products/ProductsSortSelect'
import AdminActions from '@/components/products/AdminActions'
import ProductCard from '@/components/products/ProductCard'
import PaginationNav from '@/components/ui/PaginationNav'
import {
  CATEGORY_SHELF_EXCLUDE_TAGS,
  CONSUMABLES_CATEGORY_SLUG,
  HARDWARE_CATEGORY_SLUG,
  NEW_LISTING_EXCLUDED_CATEGORY_SLUGS,
  homeCategoryProductListParams,
} from '@/lib/store-shelves'

export const dynamic = 'force-dynamic'

export async function generateMetadata(): Promise<Metadata> {
  const image = await getShareImage('products')
  return {
    openGraph: { images: [{ url: image }] },
    twitter: { card: 'summary_large_image', images: [image] },
  }
}

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
    exclude_tags?: string
    exclude_bundles?: string
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
  exclude_tags?: string
  exclude_bundles?: string
  supplier_slug?: string
  delivery_group?: string
}) {
  try {
    const isHardwareShelf = params.category === HARDWARE_CATEGORY_SLUG
    const isConsumablesShelf = params.category === CONSUMABLES_CATEGORY_SLUG
    const excludeTagsForApi =
      isHardwareShelf || isConsumablesShelf
        ? (params.exclude_tags?.trim() ? params.exclude_tags : CATEGORY_SHELF_EXCLUDE_TAGS)
        : params.exclude_tags || undefined

    const response = await serverEcommerceApi.products.list({
      is_active: true,
      category: params.category,
      search: params.search,
      condition: params.condition,
      featured: params.featured === 'true' ? true : undefined,
      /** Matches home rails: vintage & new pools exclude already-featured items. */
      exclude_featured: params.condition === 'new' ? true : undefined,
      page: params.page ? parseInt(params.page) : 1,
      page_size: 24,
      ordering: params.sort || undefined,
      bundle_only: params.bundle_only === 'true' ? 'true' : undefined,
      timed_only: params.timed_only === 'true' ? 'true' : undefined,
      exclude_tags: excludeTagsForApi,
      exclude_bundles:
        isHardwareShelf ||
        isConsumablesShelf ||
        params.condition === 'new' ||
        params.exclude_bundles === 'true'
          ? 'true'
          : undefined,
      exclude_category:
        params.condition === 'new' ? NEW_LISTING_EXCLUDED_CATEGORY_SLUGS : undefined,
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

/** Categories A–Z that have at least one active, listable product (matches home shelf rules per slug). */
async function getProductFilterCategories(): Promise<{ name: string; slug: string }[]> {
  try {
    const catRes = await serverEcommerceApi.categories.list()
    const catRaw = Array.isArray(catRes) ? catRes : (catRes as any)?.results || (catRes as any)?.data || []
    const rows = (catRaw as { name?: string; slug?: string }[])
      .filter((c) => String(c?.name || '').trim() && String(c?.slug || '').trim())
      .sort((a, b) =>
        String(a.name).localeCompare(String(b.name), undefined, { sensitivity: 'base' }),
      )

    const settled = await Promise.allSettled(
      rows.map((c) =>
        serverEcommerceApi.products.list({
          ...homeCategoryProductListParams(String(c.slug).trim()),
          page_size: 1,
        }),
      ),
    )

    const out: { name: string; slug: string }[] = []
    rows.forEach((cat, i) => {
      const res = settled[i]
      if (res.status !== 'fulfilled') return
      const val = (res as PromiseFulfilledResult<unknown>).value
      const raw = Array.isArray(val) ? val : (val as any)?.data || (val as any)?.results || []
      const has = raw.some((p: Product) => p.status !== 'archived')
      if (has) {
        out.push({ name: String(cat.name).trim(), slug: String(cat.slug).trim() })
      }
    })
    return out
  } catch (e) {
    console.error('[products] category filter list failed', e)
    return []
  }
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams

  if (params.condition === 'vintage') {
    const q = new URLSearchParams()
    ;(Object.keys(params) as (keyof typeof params)[]).forEach((key) => {
      if (key === 'condition') return
      const val = params[key]
      if (val !== undefined && val !== '') q.set(key, String(val))
    })
    if (!q.has('category')) q.set('category', 'vintage')
    redirect(`/products?${q.toString()}`)
  }

  const [{ products, pagination }, filterCategories] = await Promise.all([
    getProducts(params),
    getProductFilterCategories(),
  ])
  const isNew = params.condition === 'new'
  const isFeatured = params.featured === 'true'
  const isBundles = params.bundle_only === 'true'
  const isTimed = params.timed_only === 'true'
  const isSupplierGroup = !!params.supplier_slug
  const isHardwareCategory = params.category === HARDWARE_CATEGORY_SLUG
  const isConsumablesCategory = params.category === CONSUMABLES_CATEGORY_SLUG
  const isOtherProductCategory =
    !!params.category && !isHardwareCategory && !isConsumablesCategory

  const selectedCategoryLabel = params.category
    ? filterCategories.find((c) => c.slug === params.category)?.name
    : undefined

  const searchParamsForNav: Record<string, string> = {}
  if (params.condition) searchParamsForNav.condition = params.condition
  if (params.category) searchParamsForNav.category = params.category
  if (params.search) searchParamsForNav.search = params.search
  if (params.featured) searchParamsForNav.featured = params.featured
  if (params.sort) searchParamsForNav.sort = params.sort
  if (params.bundle_only) searchParamsForNav.bundle_only = params.bundle_only
  if (params.timed_only) searchParamsForNav.timed_only = params.timed_only
  if (params.exclude_tags?.trim()) searchParamsForNav.exclude_tags = params.exclude_tags
  if (isHardwareCategory || isConsumablesCategory) {
    searchParamsForNav.exclude_tags =
      params.exclude_tags?.trim() || CATEGORY_SHELF_EXCLUDE_TAGS
  }
  if (
    isHardwareCategory ||
    isConsumablesCategory ||
    params.condition === 'new' ||
    params.exclude_bundles === 'true'
  ) {
    searchParamsForNav.exclude_bundles = 'true'
  }
  if (params.supplier_slug) searchParamsForNav.supplier_slug = params.supplier_slug
  if (params.delivery_group) searchParamsForNav.delivery_group = params.delivery_group

  const title = isSupplierGroup
    ? 'Delivery Group'
    : isBundles
      ? 'Bundles'
      : isTimed
        ? 'Timed Products'
        : isHardwareCategory
          ? selectedCategoryLabel || 'Hardware'
          : isConsumablesCategory
            ? selectedCategoryLabel || 'Consumables'
            : isOtherProductCategory
              ? selectedCategoryLabel || params.category || 'Products'
              : isNew
                ? 'New Arrivals'
                : isFeatured
                  ? 'Featured Products'
                  : 'All Products'

  const isAllShelves =
    !params.condition &&
    !params.category &&
    params.featured !== 'true' &&
    !params.bundle_only &&
    !params.timed_only &&
    !params.supplier_slug

  const subtitle = isSupplierGroup
    ? 'Products grouped together by supplier delivery rules.'
    : isBundles
      ? 'Curated bundles with bundled buying rules.'
      : isTimed
        ? 'Limited-time products with expiry countdowns.'
        : isHardwareCategory
          ? params.exclude_tags
            ? 'Hardware category (no bundles). Products with these tags are hidden: ' +
              params.exclude_tags.replace(/,/g, ', ') +
              '.'
            : 'Products in the hardware category. Bundles are excluded.'
          : isConsumablesCategory
            ? params.exclude_tags
              ? 'Consumables category (no bundles). Products with these tags are hidden: ' +
                params.exclude_tags.replace(/,/g, ', ') +
                '.'
              : 'Products in the consumables category. Bundles are excluded.'
            : isOtherProductCategory
              ? 'Products in this category.'
              : isNew
                ? 'Fresh finds and modern essentials. Bundles and dedicated category shelves use their own filters.'
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
      exclude_tags: params.exclude_tags || null,
      exclude_bundles:
        params.category === HARDWARE_CATEGORY_SLUG ||
        params.category === CONSUMABLES_CATEGORY_SLUG ||
        params.condition === 'new' ||
        params.exclude_bundles === 'true'
          ? 'true'
          : null,
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
      <PageHero pageSlug="products" />
      {/* Admin Management Actions */}
      <AdminActions />

      {/* Page Header */}
      <section
        className={`py-12 ${
          isBundles
            ? 'bg-blue-700'
            : isTimed
              ? 'bg-amber-600'
              : isHardwareCategory
                ? 'bg-zinc-700'
                : isConsumablesCategory
                  ? 'bg-emerald-700'
                  : isOtherProductCategory
                    ? 'bg-slate-600'
                    : isNew
                      ? 'bg-modern-primary'
                      : isFeatured
                        ? 'bg-purple-600'
                        : isSupplierGroup
                          ? 'bg-slate-700'
                          : 'bg-gradient-to-r from-vintage-primary to-modern-primary'
        } text-white`}
      >
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
                {(params.exclude_tags ||
                  isHardwareCategory ||
                  isConsumablesCategory) && (
                  <input
                    type="hidden"
                    name="exclude_tags"
                    value={
                      params.exclude_tags?.trim() ||
                      (isHardwareCategory || isConsumablesCategory
                        ? CATEGORY_SHELF_EXCLUDE_TAGS
                        : '')
                    }
                  />
                )}
                {(params.category === HARDWARE_CATEGORY_SLUG ||
                  params.category === CONSUMABLES_CATEGORY_SLUG ||
                  params.condition === 'new' ||
                  params.exclude_bundles === 'true') && (
                  <input type="hidden" name="exclude_bundles" value="true" />
                )}
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

            {/* Shelf filters — aligned with home page sections */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2 text-sm text-text-muted">
                <Filter className="w-5 h-5 flex-shrink-0" />
                <span>
                  Category chips list every storefront category that currently has active products (A–Z). The New filter
                  omits featured listings; hardware and consumables omit bundles and the vintage / new / others tags.
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                <Link
                  href={makeHref({
                    condition: null,
                    category: null,
                    featured: null,
                    bundle_only: null,
                    timed_only: null,
                    exclude_tags: null,
                    exclude_bundles: null,
                    supplier_slug: null,
                    delivery_group: null,
                  })}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-1 ${
                    isAllShelves ? 'bg-vintage-primary text-white' : 'bg-gray-100 text-text hover:bg-gray-200'
                  }`}
                >
                  All
                </Link>
                <Link
                  href={
                    params.featured === 'true'
                      ? makeHref({ featured: null, condition: null })
                      : makeHref({
                          featured: 'true',
                          condition: null,
                          bundle_only: null,
                          timed_only: null,
                          category: null,
                          exclude_tags: null,
                          exclude_bundles: null,
                          supplier_slug: null,
                          delivery_group: null,
                        })
                  }
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-1 ${
                    isFeatured ? 'bg-purple-600 text-white' : 'bg-gray-100 text-text hover:bg-gray-200'
                  }`}
                >
                  <Star className="w-4 h-4" />
                  Featured
                </Link>
                <Link
                  href={makeHref({
                    featured: null,
                    condition: 'new',
                    category: null,
                    exclude_tags: null,
                    exclude_bundles: null,
                    bundle_only: null,
                    timed_only: null,
                    supplier_slug: null,
                    delivery_group: null,
                  })}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-1 ${
                    isNew ? 'bg-modern-primary text-white' : 'bg-gray-100 text-text hover:bg-gray-200'
                  }`}
                >
                  <Sparkles className="w-4 h-4" />
                  New
                </Link>
                <Link
                  href={makeHref({
                    featured: null,
                    bundle_only: 'true',
                    timed_only: null,
                    condition: null,
                    category: null,
                    exclude_tags: null,
                    exclude_bundles: null,
                    supplier_slug: null,
                    delivery_group: null,
                  })}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-1 ${
                    isBundles ? 'bg-blue-700 text-white' : 'bg-gray-100 text-text hover:bg-gray-200'
                  }`}
                >
                  <Package className="w-4 h-4" />
                  Bundles
                </Link>
                {filterCategories.map((cat) => {
                  const isHardware = cat.slug === HARDWARE_CATEGORY_SLUG
                  const isConsumables = cat.slug === CONSUMABLES_CATEGORY_SLUG
                  const isActive = params.category === cat.slug
                  const chipClass =
                    isHardware && isActive
                      ? 'bg-zinc-700 text-white'
                      : isConsumables && isActive
                        ? 'bg-emerald-700 text-white'
                        : isActive && !isHardware && !isConsumables
                          ? 'bg-slate-600 text-white'
                          : 'bg-gray-100 text-text hover:bg-gray-200'
                  return (
                    <Link
                      key={cat.slug}
                      href={makeHref({
                        featured: null,
                        condition: null,
                        category: cat.slug,
                        exclude_tags:
                          isHardware || isConsumables ? CATEGORY_SHELF_EXCLUDE_TAGS : null,
                        exclude_bundles: isHardware || isConsumables ? 'true' : null,
                        bundle_only: null,
                        timed_only: null,
                        supplier_slug: null,
                        delivery_group: null,
                      })}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-1 ${chipClass}`}
                    >
                      <Package className="w-4 h-4" />
                      {cat.name}
                    </Link>
                  )
                })}
                <Link
                  href={makeHref({
                    featured: null,
                    timed_only: 'true',
                    bundle_only: null,
                    condition: null,
                    category: null,
                    exclude_tags: null,
                    exclude_bundles: null,
                    supplier_slug: null,
                    delivery_group: null,
                  })}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-1 ${
                    isTimed ? 'bg-amber-600 text-white' : 'bg-gray-100 text-text hover:bg-gray-200'
                  }`}
                >
                  <TimerReset className="w-4 h-4" />
                  Timed
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
                  <ProductCard key={product.id} product={product} homeQuickView />
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
