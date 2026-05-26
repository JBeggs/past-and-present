import { describe, expect, it } from 'vitest'
import type { Product } from '@/lib/types'
import {
  buildProductsPageOgImageUrl,
  buildProductsWhatsAppMessage,
  getProductsCollageImageUrls,
  resolveProductsPageTitle,
} from '@/lib/products-share'

const baseProduct = (overrides: Partial<Product> = {}): Product =>
  ({
    id: '1',
    name: 'Test Product',
    slug: 'test-product',
    price: '99.00',
    image: '/media/products/a.jpg',
    status: 'active',
    ...overrides,
  }) as Product

describe('resolveProductsPageTitle', () => {
  it('uses category label when category filter is set', () => {
    expect(
      resolveProductsPageTitle(
        { category: 'print-on-anything' },
        [{ name: 'Print on Anything', slug: 'print-on-anything' }],
      ),
    ).toBe('Print on Anything')
  })

  it('falls back to All Products', () => {
    expect(resolveProductsPageTitle({}, [])).toBe('All Products')
  })
})

describe('getProductsCollageImageUrls', () => {
  it('collects up to four product images', () => {
    const products = [
      baseProduct({ id: '1', image: '/media/products/1.jpg' }),
      baseProduct({ id: '2', image: '/media/products/2.jpg' }),
      baseProduct({ id: '3', image: '/images/products/default.svg' }),
    ]
    const urls = getProductsCollageImageUrls(products)
    expect(urls).toHaveLength(2)
    expect(urls[0]).toMatch(/^https?:\/\//)
  })
})

describe('buildProductsWhatsAppMessage', () => {
  it('includes products, url, and categories at the bottom', () => {
    const msg = buildProductsWhatsAppMessage({
      title: 'Print on Anything',
      companyName: 'Past and Present',
      pageUrl: 'https://past-and-present.co.za/products?category=print-on-anything',
      products: [baseProduct({ name: 'Heat Press', price: '9720.00' })],
      categories: [
        { name: 'Print on Anything', slug: 'print-on-anything' },
        { name: 'Welding machines', slug: 'welding' },
      ],
    })
    expect(msg).toContain('Print on Anything — Past and Present')
    expect(msg).toContain('Heat Press — R9720.00')
    expect(msg).toContain('https://past-and-present.co.za/products?category=print-on-anything')
    expect(msg).toContain('Categories:')
    expect(msg).toContain('Print on Anything · Welding machines')
  })
})

describe('buildProductsPageOgImageUrl', () => {
  it('points at og-products API with image params', () => {
    process.env.NEXT_PUBLIC_SITE_URL = 'https://past-and-present.co.za'
    const url = buildProductsPageOgImageUrl('Print on Anything', [
      baseProduct({ image: '/media/products/a.jpg' }),
    ])
    expect(url).toContain('/api/og-products?')
    expect(url).toContain('title=Print')
    expect(url).toContain('img=')
  })
})
