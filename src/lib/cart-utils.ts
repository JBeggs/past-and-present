import type { Cart, CartItem } from './types'
import { formatCountdown, getMinQuantity, getStockQuantity, isBundleProduct } from './product-utils'
import {
  ensureAbsoluteImageUrl,
  getProductGalleryThumbImages,
  getPublicImageUrl,
  MAX_BUNDLE_PRODUCT_IMAGES,
} from './image-utils'

export const COURIER_GUY_SLUGS = new Set(['temu', 'aliexpress', 'ubuy', 'gumtree', 'shein'])
/** Overseas imports — Courier Guy; may carry supplier surcharge when product has delivery fields. */
export const IMPORT_SUPPLIER_SLUGS = new Set(['temu', 'aliexpress', 'ubuy', 'shein'])
export const OTHER_GROUP = '__other__'

function normalizeSupplierSlug(item: CartItem): string {
  return String(item.supplier_slug ?? item.supplierSlug ?? '').trim().toLowerCase()
}

export function isImportSupplier(slug: string): boolean {
  return IMPORT_SUPPLIER_SLUGS.has(String(slug ?? '').trim().toLowerCase())
}

/** True when group products carry supplier flat delivery and/or free-delivery threshold. */
export function groupHasSupplierDeliveryFields(items: CartItem[]): boolean {
  return getSupplierDeliveryCost(items) > 0 || getGroupThreshold(items) != null
}

/** Import with product-level surcharge/threshold (same rules for shein, temu, etc. when configured). */
export function hasImportSurchargeGroup(slug: string, items: CartItem[]): boolean {
  return isImportSupplier(slug) && groupHasSupplierDeliveryFields(items)
}

/**
 * Return true if the cart item ships via Courier Guy. Imports (temu/aliexpress/ubuy/shein)
 * and gumtree always qualify; first-party storefront items (blank supplier_slug)
 * also qualify — priced from the company address using product weight/dimensions.
 * Mirrors `uses_courier_guy_or_first_party` in django-crm/ecommerce/constants.py.
 */
export function isCourierGuyCartItem(item: CartItem): boolean {
  const slug = normalizeSupplierSlug(item)
  return slug === '' || COURIER_GUY_SLUGS.has(slug)
}

export function normalizeCartResponse(response: any): Cart | null {
  if (!response) return null
  if (response?.results && Array.isArray(response.results)) return response.results[0] ?? null
  if (response?.data) return response.data ?? null
  return response
}

export function getCartItemKey(item: CartItem): string {
  return item.product_id || item.id
}

export function getCartItemImages(item: CartItem): string[] {
  const bundleImages = Array.isArray(item.bundle_images) ? item.bundle_images : []
  const parsedBundleImages = bundleImages
    .map((img: unknown) => (typeof img === 'string' ? img : (img as { url?: string })?.url || ''))
    .filter(Boolean) as string[]
  const main = item.product_image || item.product?.image || ''
  const rawFull = (item.is_bundle && parsedBundleImages.length > 0)
    ? parsedBundleImages
    : [main, ...parsedBundleImages].filter(Boolean)
  const fullUrls = rawFull.map(ensureAbsoluteImageUrl).slice(0, MAX_BUNDLE_PRODUCT_IMAGES)
  const nested = item.product as
    | { image_thumbnail?: string | null; image_thumbnails?: string[] | null }
    | undefined
  return getProductGalleryThumbImages(fullUrls, {
    image_thumbnail: nested?.image_thumbnail,
    image_thumbnails: nested?.image_thumbnails,
  }).map(getPublicImageUrl)
}

/** Thumbnail URLs for cart/checkout line items (alias for clarity at call sites). */
export function getCartItemThumbImages(item: CartItem): string[] {
  return getCartItemImages(item)
}

export function isTimedCartItem(item: CartItem): boolean {
  return Boolean(item.timed_expires_at)
}

export function getSupplierGroupSlug(item: CartItem): string {
  const slug = String(item.supplier_slug ?? item.supplierSlug ?? '').trim().toLowerCase()
  return slug || OTHER_GROUP
}

export function getGroupThreshold(items: CartItem[]): number | null {
  const raw = items.find((item) => item.free_delivery_threshold != null)?.free_delivery_threshold
  if (raw == null) return null
  const parsed = typeof raw === 'number' ? raw : parseFloat(String(raw))
  return Number.isFinite(parsed) ? parsed : null
}

export function getSupplierDeliveryCost(items: CartItem[]): number {
  for (const item of items) {
    const raw = item.supplier_delivery_cost
      ?? (item.product as { supplier_delivery_cost?: number | null } | undefined)?.supplier_delivery_cost
    if (raw == null) continue
    const parsed = typeof raw === 'number' ? raw : parseFloat(String(raw))
    if (Number.isFinite(parsed) && parsed > 0) return parsed
  }
  return 0
}

/** Import surcharge from product supplier_delivery_cost (synced from products/scraper_config). */
export function getImportSurchargeDiscount(
  group: { items: CartItem[]; deliveryCharge: number },
): number {
  return group.deliveryCharge > 0 ? group.deliveryCharge : getSupplierDeliveryCost(group.items)
}

function getItemCostPrice(item: CartItem): number | null {
  const raw = item.cost_price ?? (item.product as { cost_price?: number | null } | undefined)?.cost_price
  if (raw == null) return null
  const parsed = typeof raw === 'number' ? raw : parseFloat(String(raw))
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null
}

/** Sum cost_price × qty for threshold checks; unavailable when any line lacks cost. */
export function getGroupCostSubtotal(items: CartItem[]): { total: number; unavailable: boolean } {
  let total = 0
  for (const item of items) {
    const cost = getItemCostPrice(item)
    if (cost == null) return { total: 0, unavailable: true }
    total += cost * item.quantity
  }
  return { total, unavailable: false }
}

/**
 * Imports with surcharge: show retail spend needed while eligibility uses source cost subtotal.
 */
export function sourceShortfallToRetailSpend(
  sourceShortfall: number,
  displaySubtotal: number,
  thresholdSubtotal: number,
): number {
  if (sourceShortfall <= 0) return 0
  if (thresholdSubtotal <= 0 || displaySubtotal <= 0) return sourceShortfall
  return sourceShortfall * (displaySubtotal / thresholdSubtotal)
}

export function groupCartItems(items: CartItem[]) {
  const groups = new Map<string, CartItem[]>()
  items.forEach((item) => {
    const slug = getSupplierGroupSlug(item)
    const existing = groups.get(slug) ?? []
    existing.push(item)
    groups.set(slug, existing)
  })
  return Array.from(groups.entries()).map(([slug, groupItems]) => {
    const displaySubtotal = groupItems.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0)
    const { total: thresholdSubtotal, unavailable: thresholdUnavailable } = getGroupCostSubtotal(groupItems)
    const threshold = slug === OTHER_GROUP ? null : getGroupThreshold(groupItems)
    const isCourierGuy = COURIER_GUY_SLUGS.has(slug)
    const hasImportSurcharge = hasImportSurchargeGroup(slug, groupItems)
    const belowThreshold =
      !thresholdUnavailable &&
      threshold != null &&
      thresholdSubtotal < threshold &&
      (!isCourierGuy || hasImportSurcharge)
    const supplierDeliveryCost = getSupplierDeliveryCost(groupItems)
    const deliveryCharge = slug === OTHER_GROUP
      ? 0
      : isCourierGuy && !hasImportSurcharge
        ? 0
        : belowThreshold || threshold == null
          ? supplierDeliveryCost
          : 0
    const sourceShortfall =
      belowThreshold && threshold != null ? Math.max(0, threshold - thresholdSubtotal) : 0
    const amountToFreeDelivery = hasImportSurcharge
      ? sourceShortfallToRetailSpend(sourceShortfall, displaySubtotal, thresholdSubtotal)
      : sourceShortfall
    return {
      slug,
      items: groupItems,
      subtotal: displaySubtotal,
      displaySubtotal,
      thresholdSubtotal,
      thresholdUnavailable,
      threshold,
      belowThreshold,
      isImport: isCourierGuy,
      isCourierGuy,
      hasImportSurcharge,
      amountToFreeDelivery,
      deliveryCharge,
    }
  })
}

export function getCartExtraDelivery(items: CartItem[]): number {
  return groupCartItems(items).reduce((sum, group) => sum + group.deliveryCharge, 0)
}

export function formatCartCountdown(item: CartItem): string {
  return formatCountdown(item.timed_expires_at)
}

export function getItemMinQuantity(item: CartItem): number {
  return isBundleProduct(item) ? 1 : getMinQuantity(item)
}

/** Returns stock quantity for cart limits. Returns null when supplier-controlled (stock 0 or untracked = endless). */
export function getItemStockQuantity(item: CartItem): number | null {
  const product = item.product ?? item
  if ((product as any)?.track_inventory === false) return null
  const raw = item.stock_quantity ?? getStockQuantity(product)
  if (raw == null || raw <= 0) return null
  return raw
}
