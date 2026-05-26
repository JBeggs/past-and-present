import type { Product } from '@/lib/types'
import { getProductCardImages } from '@/lib/image-utils'
import { openGraphImageFromMediaUrl, publicSiteOrigin } from '@/lib/product-seo'
import {
  CONSUMABLES_CATEGORY_SLUG,
  HARDWARE_CATEGORY_SLUG,
} from '@/lib/store-shelves'

export type ProductsPageFilterParams = {
  condition?: string
  category?: string
  featured?: string
  bundle_only?: string
  timed_only?: string
  supplier_slug?: string
}

export function resolveProductsPageTitle(
  params: ProductsPageFilterParams,
  filterCategories: { name: string; slug: string }[],
): string {
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

  if (isSupplierGroup) return 'Delivery Group'
  if (isBundles) return 'Bundles'
  if (isTimed) return 'Timed Products'
  if (isHardwareCategory) return selectedCategoryLabel || 'Hardware'
  if (isConsumablesCategory) return selectedCategoryLabel || 'Consumables'
  if (isOtherProductCategory) return selectedCategoryLabel || params.category || 'Products'
  if (isNew) return 'New Arrivals'
  if (isFeatured) return 'Featured Products'
  return 'All Products'
}

const DEFAULT_PLACEHOLDER = '/images/products/default.svg'
const MAX_COLLAGE_IMAGES = 4
const MAX_SHARE_PRODUCT_LINES = 12

function isGalleryPlaceholderUrl(url: string): boolean {
  if (!url) return true
  try {
    const pathname = new URL(url, 'https://placeholder.local').pathname
    return pathname === DEFAULT_PLACEHOLDER || pathname.endsWith(DEFAULT_PLACEHOLDER)
  } catch {
    return url === DEFAULT_PLACEHOLDER || url.endsWith(DEFAULT_PLACEHOLDER)
  }
}

/** First card image from each product, up to four, for OG collage. */
export function getProductsCollageImageUrls(products: Product[]): string[] {
  const urls: string[] = []
  for (const product of products) {
    if (urls.length >= MAX_COLLAGE_IMAGES) break
    const first = getProductCardImages(product)[0]
    if (!first || isGalleryPlaceholderUrl(first)) continue
    urls.push(openGraphImageFromMediaUrl(first))
  }
  return urls
}

/** Absolute OG image URL — collage when product images exist, else branded default. */
export function buildProductsPageOgImageUrl(title: string, products: Product[]): string {
  const site = publicSiteOrigin()
  if (!site) return '/favicon.png'

  const params = new URLSearchParams()
  params.set('title', title)
  for (const url of getProductsCollageImageUrls(products)) {
    params.append('img', url)
  }

  return `${site}/api/og-products?${params.toString()}`
}

function formatProductPriceLine(product: Product): string {
  const price = Number(product.price)
  const compare =
    product.compare_at_price != null ? Number(product.compare_at_price) : null
  const priceText =
    compare != null && compare > price
      ? `R${price.toFixed(2)} (was R${compare.toFixed(2)})`
      : `R${price.toFixed(2)}`
  return `${product.name} — ${priceText}`
}

export function buildProductsWhatsAppMessage(input: {
  title: string
  companyName: string
  pageUrl: string
  products: Product[]
  categories: { name: string; slug: string }[]
}): string {
  const { title, companyName, pageUrl, products, categories } = input
  const productLines = products
    .slice(0, MAX_SHARE_PRODUCT_LINES)
    .map(formatProductPriceLine)
  const categoryLine =
    categories.length > 0
      ? categories.map((c) => c.name).join(' · ')
      : ''

  return [
    `${title} — ${companyName}`,
    productLines.length > 0 ? productLines.join('\n') : 'Browse our latest products.',
    pageUrl,
    categoryLine ? `Categories:\n${categoryLine}` : '',
    companyName ? `Love ${companyName}` : '',
  ]
    .filter(Boolean)
    .join('\n\n')
}
