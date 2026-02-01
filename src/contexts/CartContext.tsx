'use client'

import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { ecommerceApi } from '@/lib/api'
import { Cart } from '@/lib/types'
import { useAuth } from './AuthContext'

interface CartContextType {
  cart: Cart | null
  itemCount: number
  loading: boolean
  refreshCart: () => Promise<void>
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<Cart | null>(null)
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  const refreshCart = useCallback(async () => {
    if (!user) {
      setCart(null)
      setLoading(false)
      return
    }

    try {
      const response = await ecommerceApi.cart.get() as any
      let cartData = null
      
      if (response?.results && Array.isArray(response.results)) {
        cartData = response.results[0]
      } else if (response?.data) {
        cartData = response.data
      } else {
        cartData = response
      }
      
      setCart(cartData)
    } catch (error) {
      console.error('Error refreshing cart:', error)
      setCart(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refreshCart()
  }, [refreshCart, user])

  const itemCount = cart?.items?.reduce((acc, item) => acc + item.quantity, 0) || 0

  return (
    <CartContext.Provider value={{ cart, itemCount, loading, refreshCart }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
