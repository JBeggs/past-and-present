/** Must match `Category.slug` in Django for this company. */
export const HARDWARE_CATEGORY_SLUG = 'hardware'
export const CONSUMABLES_CATEGORY_SLUG = 'consumables'

/** Omit merchandising tags from dedicated category shelves (home + deep links). */
export const CATEGORY_SHELF_EXCLUDE_TAGS = 'vintage,new,others'

/**
 * Comma-separated slugs for API `exclude_category` on the “new” pool
 * (home New Arrivals + `/products?condition=new`).
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
