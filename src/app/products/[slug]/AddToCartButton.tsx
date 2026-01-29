'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ecommerceApi } from '@/lib/api'
import { useToast } from '@/contexts/ToastContext'
import { Product } from '@/lib/types'
import { ShoppingCart, Plus, Minus } from 'lucide-react'

interface AddToCartButtonProps {
  product: Product
}

export default function AddToCartButton({ product }: AddToCartButtonProps) {
  const [quantity, setQuantity] = useState(1)
  const [loading, setLoading] = useState(false)
  const { showSuccess, showError } = useToast()
  const router = useRouter()

  const handleAddToCart = async () => {
    if (product.quantity === 0) return

    setLoading(true)
    try {
      await ecommerceApi.cart.addItem(product.id, quantity)
      showSuccess(`${product.name} added to cart!`)
      router.refresh()
    } catch (error: any) {
      showError(error.message || 'Failed to add to cart')
    } finally {
      setLoading(false)
    }
  }

  const isOutOfStock = product.quantity === 0
  const maxQuantity = Math.min(product.quantity, 10)

  return (
    <div className="space-y-4">
      {/* Quantity Selector */}
      <div className="flex items-center gap-4">
        <span className="text-sm font-medium text-text">Quantity:</span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            disabled={quantity <= 1 || isOutOfStock}
            className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 disabled:opacity-50 transition-colors"
          >
            <Minus className="w-4 h-4" />
          </button>
          <span className="w-12 text-center font-medium text-lg">{quantity}</span>
          <button
            onClick={() => setQuantity(Math.min(maxQuantity, quantity + 1))}
            disabled={quantity >= maxQuantity || isOutOfStock}
            className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 disabled:opacity-50 transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Add to Cart Button */}
      <button
        onClick={handleAddToCart}
        disabled={loading || isOutOfStock}
        className={`w-full py-4 rounded-lg font-semibold text-lg flex items-center justify-center gap-2 transition-colors ${
          isOutOfStock
            ? 'bg-gray-200 text-text-muted cursor-not-allowed'
            : product.is_vintage
              ? 'bg-vintage-primary text-white hover:bg-vintage-primary-dark'
              : 'bg-modern-primary text-white hover:bg-modern-primary-dark'
        }`}
      >
        <ShoppingCart className="w-5 h-5" />
        {loading ? 'Adding...' : isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
      </button>
    </div>
  )
}
