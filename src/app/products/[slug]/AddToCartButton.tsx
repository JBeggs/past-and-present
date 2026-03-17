'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/contexts/ToastContext'
import { useCart } from '@/contexts/CartContext'
import { Product } from '@/lib/types'
import { useAuth } from '@/contexts/AuthContext'
import { ShoppingCart, Plus, Minus, Package, TimerReset, Truck } from 'lucide-react'
import { formatCountdown, getMinQuantity, getStockQuantity, isBundleProduct } from '@/lib/product-utils'

interface AddToCartButtonProps {
  product: Product
}

export default function AddToCartButton({ product }: AddToCartButtonProps) {
  const { user } = useAuth()
  const minQty = getMinQuantity(product)
  const isBundle = isBundleProduct(product)
  const stockQty = getStockQuantity(product)
  const maxQuantity = isBundle ? 1 : (stockQty != null && stockQty > 0 ? Math.min(10, stockQty) : 10)
  // stock 0 or null = supplier controlled / endless stock; never block (backend can reject if needed)
  const outOfStock = false
  const [quantity, setQuantity] = useState(minQty)
  const [loading, setLoading] = useState(false)
  const [countdown, setCountdown] = useState(() => formatCountdown(product.timed_expires_at))
  const { showSuccess, showError } = useToast()
  const { cart, addItemToCart } = useCart()
  const router = useRouter()

  useEffect(() => {
    setQuantity(minQty)
  }, [minQty, product.id])

  useEffect(() => {
    if (!product.timed_expires_at) {
      setCountdown('')
      return
    }
    setCountdown(formatCountdown(product.timed_expires_at))
    const interval = window.setInterval(() => {
      setCountdown(formatCountdown(product.timed_expires_at))
    }, 1000)
    return () => window.clearInterval(interval)
  }, [product.timed_expires_at])

  const isExpired = countdown === 'Expired'
  const quantityLabel = useMemo(() => (isBundle ? 'Bundle quantity' : 'Quantity'), [isBundle])

  const supplierSlug = (product as { supplier_slug?: string; supplierSlug?: string }).supplier_slug
    ?? (product as { supplierSlug?: string }).supplierSlug ?? ''
  const isGumtree = String(supplierSlug).trim().toLowerCase() === 'gumtree'
  const cartAlreadyHasThisProduct = (cart?.items ?? []).some(
    (i) => String(i.product_id ?? i.id) === String(product.id)
  )
  const gumtreeDuplicate = isGumtree && cartAlreadyHasThisProduct

  const handleAddToCart = async (e: React.MouseEvent) => {
    if (isExpired) {
      showError('This timed product has expired')
      return
    }
    if (gumtreeDuplicate) {
      showError('This Gumtree product is already in your cart. Update quantity in the cart.')
      return
    }
    const cartAlreadyHasBundle = cart?.items?.some((i) => i.is_bundle) ?? false
    if (isBundle && cartAlreadyHasBundle) {
      showError('Bundles are limited to one per customer.')
      return
    }

    setLoading(true)
    try {
      await addItemToCart(product, quantity)
      showSuccess(`${product.name} added to cart!`)
      if (typeof window !== 'undefined') {
        const rect = (e.target as HTMLElement).closest('button')?.getBoundingClientRect()
        const startX = rect ? rect.left + rect.width / 2 : undefined
        const startY = rect ? rect.top + rect.height / 2 : undefined
        window.dispatchEvent(new CustomEvent('cart-item-added', { detail: { startX, startY } }))
      }
      router.refresh()
    } catch (error: any) {
      console.error('AddToCartButton: addItem failed', error)
      const errorMsg = error?.details?.error?.message || error.message || 'Failed to add to cart'
      showError(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        {isBundle && (
          <p className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-700">
            <Package className="w-4 h-4" />
            Bundle
          </p>
        )}
        {product.timed_expires_at && (
          <p className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-semibold ${isExpired ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700'}`}>
            <TimerReset className="w-4 h-4" />
            {countdown}
          </p>
        )}
        {product.delivery_time && (
          <p className="flex items-center gap-2 text-sm text-text-muted">
            <Truck className="w-4 h-4" />
            Delivery: {product.delivery_time}
          </p>
        )}
        {minQty > 1 && (
          <p className="text-sm text-text-muted">Minimum order: {minQty}</p>
        )}
        {isBundle && (
          <p className="text-sm text-text-muted">Bundles are limited to one per customer.</p>
        )}
      </div>

      {/* Quantity Selector */}
      {!outOfStock && (
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-text">{quantityLabel}:</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setQuantity(Math.max(minQty, quantity - 1))}
              disabled={quantity <= minQty || isExpired}
              className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 disabled:opacity-50 transition-colors"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="w-12 text-center font-medium text-lg">{quantity}</span>
            <button
              onClick={() => setQuantity(Math.min(maxQuantity, quantity + 1))}
              disabled={quantity >= maxQuantity || isExpired}
              className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 disabled:opacity-50 transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Add to Cart Button */}
      <div className="space-y-2">
        <button
          onClick={handleAddToCart}
          data-cy="add-to-cart"
          disabled={loading || isExpired || outOfStock || gumtreeDuplicate}
          className={`w-full py-4 rounded-lg font-semibold text-lg flex items-center justify-center gap-2 transition-colors ${
            isExpired || outOfStock || gumtreeDuplicate
              ? 'bg-gray-200 text-text-muted cursor-not-allowed'
              : (Array.isArray(product.tags) && product.tags.some((t: any) => (typeof t === 'string' ? t : t.name) === 'vintage'))
              ? 'bg-vintage-primary text-white hover:bg-vintage-primary-dark'
              : 'bg-modern-primary text-white hover:bg-modern-primary-dark'
          } shadow-lg shadow-vintage-primary/10`}
        >
          <ShoppingCart className="w-5 h-5" />
          {loading ? 'Adding...' : isExpired ? 'Expired' : outOfStock ? 'Out of Stock' : gumtreeDuplicate ? 'Already in cart' : (user ? 'Add to Cart' : 'Add to Cart (Guest)')}
        </button>
      </div>
    </div>
  )
}
