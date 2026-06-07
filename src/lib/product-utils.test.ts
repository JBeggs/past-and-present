import { describe, it, expect, vi, afterEach } from 'vitest'
import {
  DEFAULT_NEW_ARRIVAL_DAYS,
  hasVintageTag,
  isNewArrival,
  isOnSale,
} from './product-utils'
import type { Product } from './types'

const baseProduct: Product = {
  id: 'p1',
  name: 'Test',
  slug: 'test',
  price: 100,
  quantity: 1,
  track_inventory: true,
  allow_backorder: false,
  is_active: true,
  featured: false,
  status: 'active',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  stock_quantity: 1,
  in_stock: true,
}

describe('product badge helpers', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('hasVintageTag detects vintage tag', () => {
    expect(hasVintageTag(baseProduct)).toBe(false)
    expect(hasVintageTag({ ...baseProduct, tags: ['vintage'] })).toBe(true)
    expect(hasVintageTag({ ...baseProduct, tags: [{ name: 'vintage' }] })).toBe(true)
  })

  it('isNewArrival uses API field when present', () => {
    expect(isNewArrival({ ...baseProduct, is_new_arrival: true })).toBe(true)
    expect(isNewArrival({ ...baseProduct, is_new_arrival: false })).toBe(false)
  })

  it('isNewArrival falls back to created_at within window', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-06-07T12:00:00Z'))
    const recent = { ...baseProduct, created_at: '2026-06-01T12:00:00Z' }
    const old = { ...baseProduct, created_at: '2026-05-01T12:00:00Z' }
    expect(isNewArrival(recent, DEFAULT_NEW_ARRIVAL_DAYS)).toBe(true)
    expect(isNewArrival(old, DEFAULT_NEW_ARRIVAL_DAYS)).toBe(false)
  })

  it('isNewArrival is false for vintage even when recent', () => {
    expect(
      isNewArrival({ ...baseProduct, tags: ['vintage'], is_new_arrival: false })
    ).toBe(false)
  })

  it('isOnSale requires compare_at_price greater than price', () => {
    expect(isOnSale(baseProduct)).toBe(false)
    expect(isOnSale({ ...baseProduct, compare_at_price: 100 })).toBe(false)
    expect(isOnSale({ ...baseProduct, compare_at_price: 120 })).toBe(true)
    expect(isOnSale({ ...baseProduct, price: 100, compare_at_price: null as any })).toBe(false)
  })
})
