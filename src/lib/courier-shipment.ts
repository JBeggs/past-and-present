export interface ShipmentEligibilityItem {
  supplier_slug?: string | null
  cancelled?: boolean
}

export interface ShipmentEligibilityOrder {
  delivery_method?: string | null
  fulfillment_split?: { gumtree?: 'collect' | 'deliver'; other_courier?: string } | null
  items?: ShipmentEligibilityItem[] | null
}

function normalizeSupplierSlug(raw: string | null | undefined): string {
  if (!raw) return ''
  return raw.trim().toLowerCase().replace(/[\s_-]+/g, '')
}

/**
 * Mirrors django-crm eligibility:
 * - first-party blank supplier_slug => Courier Guy
 * - import suppliers temu/aliexpress/ubuy/gumtree => Courier Guy
 * - gumtree is excluded when fulfillment split is collect
 * - collect-only orders do not require a shipment
 */
export function requiresCourierGuyShipment(order: ShipmentEligibilityOrder | null | undefined): boolean {
  if (!order) return false
  if ((order.delivery_method || '').trim().toLowerCase() === 'collect') return false

  const split = order.fulfillment_split || {}
  const gumtreeCollect = (split.gumtree || '').trim().toLowerCase() === 'collect'
  const hasOtherCourierLeg = Boolean((split.other_courier || '').trim())

  const activeItems = (order.items || []).filter((item) => !item?.cancelled)
  let hasNonGumtreeCourierItem = false
  let hasGumtreeCourierItem = false

  for (const item of activeItems) {
    const slug = normalizeSupplierSlug(item?.supplier_slug)
    if (!slug) {
      hasNonGumtreeCourierItem = true
      continue
    }
    if (slug === 'temu' || slug === 'aliexpress' || slug === 'ubuy') {
      hasNonGumtreeCourierItem = true
      continue
    }
    if (slug === 'gumtree') {
      hasGumtreeCourierItem = true
    }
  }

  if (hasNonGumtreeCourierItem) return true
  if (hasOtherCourierLeg) return true
  if (hasGumtreeCourierItem && !gumtreeCollect) return true
  return false
}
