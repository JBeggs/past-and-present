/**
 * Cart utils unit tests — free-delivery threshold vs supplier cost subtotal (matches API).
 */
import { describe, it, expect } from 'vitest'
import { groupCartItems, getCartExtraDelivery, isCourierGuyCartItem, sourceShortfallToRetailSpend } from './cart-utils'
import type { CartItem } from './types'

function makeItem(overrides: Partial<CartItem> & { price: number; quantity: number }): CartItem {
  return {
    id: 'item-1',
    product_id: 'prod-1',
    product_name: 'Product',
    quantity: 1,
    price: 100,
    subtotal: 100,
    supplier_slug: 'supplier-a',
    free_delivery_threshold: 500,
    supplier_delivery_cost: 50,
    created_at: new Date().toISOString(),
    ...overrides,
  } as CartItem
}

describe('groupCartItems', () => {
  it('uses cost subtotal for threshold eligibility', () => {
    const items: CartItem[] = [
      makeItem({
        id: 'a',
        product_id: 'pa',
        price: 200,
        quantity: 2,
        cost_price: 80,
        product: { cost_price: 80 } as any,
        supplier_slug: 'supplier-a',
        free_delivery_threshold: 500,
        supplier_delivery_cost: 50,
      }),
    ]
    const groups = groupCartItems(items)
    const g = groups.find((x) => x.slug === 'supplier-a')!
    expect(g.displaySubtotal).toBe(400)
    expect(g.thresholdSubtotal).toBe(160)
    expect(g.belowThreshold).toBe(true)
    expect(g.amountToFreeDelivery).toBe(340)
    expect(g.thresholdUnavailable).toBe(false)
  })

  it('threshold met when cost subtotal >= threshold even if retail is lower', () => {
    const items: CartItem[] = [
      makeItem({
        id: 'a',
        product_id: 'pa',
        price: 200,
        quantity: 5,
        cost_price: 120,
        product: { cost_price: 120 } as any,
        supplier_slug: 'supplier-a',
        free_delivery_threshold: 500,
        supplier_delivery_cost: 50,
      }),
    ]
    const groups = groupCartItems(items)
    const g = groups.find((x) => x.slug === 'supplier-a')!
    expect(g.displaySubtotal).toBe(1000)
    expect(g.thresholdSubtotal).toBe(600)
    expect(g.belowThreshold).toBe(false)
    expect(g.amountToFreeDelivery).toBe(0)
    expect(g.deliveryCharge).toBe(0)
  })

  it('marks threshold unavailable when any line is missing cost_price', () => {
    const items: CartItem[] = [
      makeItem({
        id: 'a',
        product_id: 'pa',
        price: 200,
        quantity: 3,
        cost_price: 100,
        product: { cost_price: 100 } as any,
        supplier_slug: 'supplier-a',
        free_delivery_threshold: 500,
        supplier_delivery_cost: 50,
      }),
      makeItem({
        id: 'b',
        product_id: 'pb',
        price: 150,
        quantity: 1,
        product: {},
        supplier_slug: 'supplier-a',
        free_delivery_threshold: 500,
        supplier_delivery_cost: 50,
      }),
    ]
    const groups = groupCartItems(items)
    const g = groups.find((x) => x.slug === 'supplier-a')!
    expect(g.thresholdUnavailable).toBe(true)
    expect(g.amountToFreeDelivery).toBe(0)
  })

  it('amount to free delivery uses cost shortfall not retail', () => {
    const items: CartItem[] = [
      makeItem({
        id: 'a',
        product_id: 'pa',
        price: 100,
        quantity: 1,
        cost_price: 80,
        supplier_slug: 'supplier-a',
        free_delivery_threshold: 1050,
        supplier_delivery_cost: 50,
      }),
    ]
    const groups = groupCartItems(items)
    const g = groups.find((x) => x.slug === 'supplier-a')!
    expect(g.displaySubtotal).toBe(100)
    expect(g.thresholdSubtotal).toBe(80)
    expect(g.amountToFreeDelivery).toBe(970)
  })

  it('keeps display subtotal based on selling price', () => {
    const items: CartItem[] = [
      makeItem({
        id: 'a',
        product_id: 'pa',
        price: 200,
        quantity: 2,
        cost_price: 80,
        product: { cost_price: 80 } as any,
        supplier_slug: 'supplier-a',
        free_delivery_threshold: 500,
        supplier_delivery_cost: 50,
      }),
    ]
    const groups = groupCartItems(items)
    const g = groups.find((x) => x.slug === 'supplier-a')!
    expect(g.subtotal).toBe(400)
    expect(g.displaySubtotal).toBe(400)
    expect(g.thresholdSubtotal).toBe(160)
  })

  it('Courier Guy groups without delivery fields have no threshold logic', () => {
    const items: CartItem[] = [
      makeItem({
        id: 'a',
        product_id: 'pa',
        price: 100,
        quantity: 1,
        supplier_slug: 'temu',
        supplier_delivery_cost: 0,
      }),
    ]
    const groups = groupCartItems(items)
    const g = groups.find((x) => x.slug === 'temu')!
    expect(g.isCourierGuy).toBe(true)
    expect(g.amountToFreeDelivery).toBe(0)
    expect(g.deliveryCharge).toBe(0)
  })

  it('imports with delivery fields use import surcharge path (shein)', () => {
    const items: CartItem[] = [
      makeItem({
        id: 'shein-1',
        product_id: 'pshein',
        price: 200,
        quantity: 1,
        cost_price: 80,
        supplier_slug: 'shein',
        free_delivery_threshold: 1050,
        supplier_delivery_cost: 150,
      }),
    ]
    const groups = groupCartItems(items)
    const g = groups.find((x) => x.slug === 'shein')!
    expect(g.isCourierGuy).toBe(true)
    expect(g.hasImportSurcharge).toBe(true)
    expect(g.belowThreshold).toBe(true)
    expect(g.thresholdSubtotal).toBe(80)
    expect(g.deliveryCharge).toBe(150)
    expect(g.amountToFreeDelivery).toBe(2425)
  })

  it('imports with delivery fields use same import surcharge path (temu)', () => {
    const items: CartItem[] = [
      makeItem({
        id: 'temu-1',
        product_id: 'ptemu',
        price: 200,
        quantity: 1,
        cost_price: 80,
        supplier_slug: 'temu',
        free_delivery_threshold: 1050,
        supplier_delivery_cost: 150,
      }),
    ]
    const g = groupCartItems(items).find((x) => x.slug === 'temu')!
    expect(g.hasImportSurcharge).toBe(true)
    expect(g.belowThreshold).toBe(true)
    expect(g.deliveryCharge).toBe(150)
    expect(g.amountToFreeDelivery).toBe(2425)
  })

  it('pure temu import without delivery fields has no surcharge', () => {
    const items: CartItem[] = [
      makeItem({
        id: 'a',
        product_id: 'pa',
        price: 100,
        quantity: 1,
        supplier_slug: 'temu',
        free_delivery_threshold: undefined,
        supplier_delivery_cost: undefined,
      }),
    ]
    const g = groupCartItems(items).find((x) => x.slug === 'temu')!
    expect(g.hasImportSurcharge).toBe(false)
    expect(g.deliveryCharge).toBe(0)
  })

  it('SHEIN past-and-present mold: R56.64 retail, R40 source, R1050 supplier threshold', () => {
    const items: CartItem[] = [
      makeItem({
        id: 'shein-mold',
        product_id: 'pmold',
        price: 56.64,
        quantity: 1,
        cost_price: 40,
        supplier_slug: 'shein',
        free_delivery_threshold: 1050,
        supplier_delivery_cost: 150,
      }),
    ]
    const g = groupCartItems(items).find((x) => x.slug === 'shein')!
    expect(g.thresholdSubtotal).toBe(40)
    expect(g.displaySubtotal).toBe(56.64)
    expect(g.amountToFreeDelivery).toBeCloseTo(1430.16, 1)
  })
})

describe('sourceShortfallToRetailSpend', () => {
  it('scales source shortfall by retail/source ratio', () => {
    expect(sourceShortfallToRetailSpend(1010, 56.64, 40)).toBeCloseTo(1430.16, 1)
  })
})

describe('isCourierGuyCartItem', () => {
  it('returns true for first-party items (blank supplier_slug)', () => {
    const item = makeItem({ supplier_slug: '', price: 100, quantity: 1 })
    expect(isCourierGuyCartItem(item)).toBe(true)
  })

  it('returns true for import slugs', () => {
    expect(isCourierGuyCartItem(makeItem({ supplier_slug: 'temu', price: 100, quantity: 1 }))).toBe(true)
    expect(isCourierGuyCartItem(makeItem({ supplier_slug: 'shein', price: 100, quantity: 1 }))).toBe(true)
    expect(isCourierGuyCartItem(makeItem({ supplier_slug: 'gumtree', price: 100, quantity: 1 }))).toBe(true)
    expect(isCourierGuyCartItem(makeItem({ supplier_slug: ' AliExpress ', price: 100, quantity: 1 }))).toBe(true)
  })

  it('returns false for other SA suppliers that handle their own delivery', () => {
    expect(isCourierGuyCartItem(makeItem({ supplier_slug: 'supplier-a', price: 100, quantity: 1 }))).toBe(false)
    expect(isCourierGuyCartItem(makeItem({ supplier_slug: 'perfectdealz', price: 100, quantity: 1 }))).toBe(false)
  })

  it('treats null/undefined slug as first-party', () => {
    expect(isCourierGuyCartItem(makeItem({ supplier_slug: null as any, price: 100, quantity: 1 }))).toBe(true)
    expect(isCourierGuyCartItem({ ...makeItem({ price: 100, quantity: 1 }), supplier_slug: undefined } as any)).toBe(true)
  })
})

describe('getCartExtraDelivery', () => {
  it('sums delivery charges from cost-threshold groups', () => {
    const items: CartItem[] = [
      makeItem({
        id: 'a',
        product_id: 'pa',
        price: 100,
        quantity: 1,
        cost_price: 50,
        product: { cost_price: 50 } as any,
        supplier_slug: 'supplier-a',
        free_delivery_threshold: 500,
        supplier_delivery_cost: 50,
      }),
      makeItem({
        id: 'b',
        product_id: 'pb',
        price: 80,
        quantity: 1,
        cost_price: 40,
        product: { cost_price: 40 } as any,
        supplier_slug: 'supplier-b',
        free_delivery_threshold: 300,
        supplier_delivery_cost: 30,
      }),
    ]
    const extra = getCartExtraDelivery(items)
    expect(extra).toBe(80)
  })
})
