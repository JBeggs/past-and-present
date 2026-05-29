import { cache } from 'react'
import { serverEcommerceApi } from '@/lib/api-server'
import { Product } from '@/lib/types'

export type ProductFilterCategory = { name: string; slug: string }

export type ProductsListResult = {
  products: Product[]
  pagination: { page: number; totalPages: number; total: number }
}

export type ProductsListParams = {
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
}

async function fetchProducts(params: ProductsListParams): Promise<ProductsListResult> {
  const {
    CATEGORY_SHELF_EXCLUDE_TAGS,
    CONSUMABLES_CATEGORY_SLUG,
    HARDWARE_CATEGORY_SLUG,
    NEW_LISTING_EXCLUDED_CATEGORY_SLUGS,
  } = await import('@/lib/store-shelves')

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

async function fetchProductFilterCategories(): Promise<ProductFilterCategory[]> {
  try {
    const catRes = await serverEcommerceApi.categories.list()
    const catRaw = Array.isArray(catRes) ? catRes : (catRes as any)?.results || (catRes as any)?.data || []
    const rows = (catRaw as { name?: string; slug?: string; product_count?: number }[])
      .filter((c) => String(c?.name || '').trim() && String(c?.slug || '').trim())
      .filter((c) => String(c.slug).trim().toLowerCase() !== 'vintage')

    const hasProductCounts = rows.some((c) => typeof c.product_count === 'number')

    const seen = new Set<string>()
    return rows
      .filter((c) => {
        const slug = String(c.slug).trim().toLowerCase()
        if (seen.has(slug)) return false
        seen.add(slug)
        return true
      })
      .filter((c) => !hasProductCounts || (c.product_count ?? 0) > 0)
      .sort((a, b) => {
        const byName = String(a.name).localeCompare(String(b.name), undefined, { sensitivity: 'base' })
        if (byName !== 0) return byName
        return String(a.slug || '').localeCompare(String(b.slug || ''), undefined, { sensitivity: 'base' })
      })
      .map((c) => ({
        name: String(c.name).trim(),
        slug: String(c.slug).trim(),
      }))
  } catch (e) {
    console.error('[products] category filter list failed', e)
    return []
  }
}

/** Per-request dedupe between generateMetadata and the page component. */
export const getProductsForPage = cache(fetchProducts)
export const getProductFilterCategories = cache(fetchProductFilterCategories)
