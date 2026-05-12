/** Must match `Category.slug` in Django for this company. */
export const HARDWARE_CATEGORY_SLUG = 'hardware'
export const CONSUMABLES_CATEGORY_SLUG = 'consumables'

/** Omit merchandising tags from dedicated category shelves (home + deep links). */
export const CATEGORY_SHELF_EXCLUDE_TAGS = 'vintage,new,others'

/**
 * Comma-separated slugs for API `exclude_category` on `/products?condition=new`.
 */
export const NEW_LISTING_EXCLUDED_CATEGORY_SLUGS = `${HARDWARE_CATEGORY_SLUG},${CONSUMABLES_CATEGORY_SLUG}`

export function categoryShelfListingHref(categorySlug: string): string {
  return `/products?category=${categorySlug}&exclude_tags=${encodeURIComponent(CATEGORY_SHELF_EXCLUDE_TAGS)}`
}

export function hardwareListingHref(): string {
  return `${categoryShelfListingHref(HARDWARE_CATEGORY_SLUG)}&exclude_bundles=true`
}

export function consumablesListingHref(): string {
  return `${categoryShelfListingHref(CONSUMABLES_CATEGORY_SLUG)}&exclude_bundles=true`
}

/**
 * Product list params for a home-page category shelf, aligned with
 * `getProducts` in `app/products/page.tsx` (hardware / consumables vs other).
 */
export function homeCategoryProductListParams(categorySlug: string): {
  is_active: true
  category: string
  page_size: number
  ordering: 'name'
  exclude_tags?: string
  exclude_bundles?: 'true'
} {
  const slug = String(categorySlug || '').trim()
  const isHardwareShelf = slug === HARDWARE_CATEGORY_SLUG
  const isConsumablesShelf = slug === CONSUMABLES_CATEGORY_SLUG
  return {
    is_active: true,
    category: slug,
    page_size: 20,
    ordering: 'name',
    ...(isHardwareShelf || isConsumablesShelf
      ? {
          exclude_tags: CATEGORY_SHELF_EXCLUDE_TAGS,
          exclude_bundles: 'true' as const,
        }
      : {}),
  }
}

/** Deep link to the full listing for a category (matches home shelf rules for hardware/consumables). */
export function categoryViewAllHref(categorySlug: string): string {
  const slug = String(categorySlug || '').trim()
  if (slug === HARDWARE_CATEGORY_SLUG) return hardwareListingHref()
  if (slug === CONSUMABLES_CATEGORY_SLUG) return consumablesListingHref()
  return `/products?category=${encodeURIComponent(slug)}`
}
