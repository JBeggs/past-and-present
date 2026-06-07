import type { CartItem, Product } from './types'

type ProductLike = Product | CartItem | Record<string, any>

/** Default new-arrival window when API does not expose company settings. */
export const DEFAULT_NEW_ARRIVAL_DAYS = 14

/** Products tagged vintage (string or Tag object shape). */
export function hasVintageTag(product: ProductLike | null | undefined): boolean {
  const tags = (product as any)?.tags
  if (!Array.isArray(tags)) return false
  return tags.some((t: string | { name?: string }) =>
    (typeof t === 'string' ? t : t?.name) === 'vintage'
  )
}

/** True when product qualifies for the New badge (within window, not vintage). */
export function isNewArrival(
  product: ProductLike | null | undefined,
  days: number = DEFAULT_NEW_ARRIVAL_DAYS
): boolean {
  if (!product) return false
  if (hasVintageTag(product)) return false
  if (typeof (product as Product).is_new_arrival === 'boolean') {
    return (product as Product).is_new_arrival === true
  }
  const createdAt = (product as any)?.created_at
  if (!createdAt || !days) return false
  const created = new Date(createdAt).getTime()
  if (Number.isNaN(created)) return false
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000
  return created >= cutoff
}

/** True when compare-at is set and greater than current price (Sale badge). */
export function isOnSale(product: ProductLike | null | undefined): boolean {
  if (!product) return false
  const price = Number((product as any)?.price)
  const compare = (product as any)?.compare_at_price
  if (compare == null || compare === '') return false
  const compareNum = Number(compare)
  if (!Number.isFinite(price) || !Number.isFinite(compareNum)) return false
  return compareNum > price
}

/** Display label for admin/about condition column. */
export function getProductConditionLabel(product: ProductLike | null | undefined): string {
  if (hasVintageTag(product)) return 'Vintage'
  if (isNewArrival(product)) return 'New'
  return '—'
}

/** Listings synced from Gumtree (supplier or source URL). */
export function isGumtreeProduct(product: ProductLike | null | undefined): boolean {
  if (!product) return false
  const slug = String((product as any).supplier_slug || '').toLowerCase()
  if (slug === 'gumtree') return true
  const src = String((product as any).source_url || (product as any).canonical_url || '').toLowerCase()
  return src.includes('gumtree.co.za')
}

export function isBundleProduct(product: ProductLike | null | undefined): boolean {
  const ids = (product as any)?.bundle_product_ids
  const itemFlag = (product as any)?.is_bundle
  if (itemFlag === true || (Array.isArray(ids) && ids.length > 0)) return true
  const nested = (product as any)?.product
  if (nested) {
    const nestedIds = nested?.bundle_product_ids
    const nestedFlag = nested?.is_bundle
    return nestedFlag === true || (Array.isArray(nestedIds) && nestedIds.length > 0)
  }
  return false
}

export function isTimedProduct(product: ProductLike | null | undefined): boolean {
  return Boolean((product as any)?.timed_expires_at || (product as any)?.timed_duration_minutes != null)
}

export function getMinQuantity(product: ProductLike | null | undefined): number {
  if (!product) return 1
  if (isBundleProduct(product)) return 1
  const raw = (product as any)?.min_quantity ?? (product as any)?.minQuantity ?? 1
  const parsed = typeof raw === 'number' ? raw : parseInt(String(raw), 10)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1
}

export function getStockQuantity(product: ProductLike | null | undefined): number | null {
  if (!product) return null
  const raw = (product as any)?.stock_quantity ?? (product as any)?.quantity
  if (raw == null) return null
  const parsed = typeof raw === 'number' ? raw : parseInt(String(raw), 10)
  return Number.isFinite(parsed) ? parsed : null
}

export function getProductImages(product: ProductLike | null | undefined): string[] {
  if (!product) return []
  const rawImages = Array.isArray((product as any)?.images) ? (product as any).images : []
  const mainImage = typeof (product as any)?.image === 'string' ? (product as any).image : ''
  const extras = rawImages
    .map((img: any) => (typeof img === 'string' ? img : img?.url || img?.file_url || ''))
    .filter(Boolean)
  return [mainImage, ...extras].filter(Boolean)
}

export function formatCountdown(expiresAt: string | null | undefined): string {
  if (!expiresAt) return ''
  const end = new Date(expiresAt).getTime()
  const now = Date.now()
  const diff = end - now
  if (diff <= 0) return 'Expired'
  const hours = Math.floor(diff / 3600000)
  const minutes = Math.floor((diff % 3600000) / 60000)
  const seconds = Math.floor((diff % 60000) / 1000)
  if (hours > 0) return `${hours}h ${minutes}m left`
  if (minutes > 0) return `${minutes}m ${seconds}s left`
  return `${seconds}s left`
}
