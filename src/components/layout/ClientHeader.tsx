'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ShoppingCart, LogOut, Package, Boxes, ImageIcon } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useCartSafe } from '@/contexts/CartContext'
import { useMounted } from '@/hooks/useMounted'
import { ProfileNavAvatar } from '@/components/layout/ProfileNavAvatar'

export default function ClientHeader() {
  const [countBump, setCountBump] = useState(false)
  let user: any = null
  let profile: any = null
  let signOut: (() => Promise<void>) | (() => void) = () => {}
  let authLoading = false
  try {
    const auth = useAuth()
    user = auth.user
    profile = auth.profile
    signOut = auth.signOut
    authLoading = auth.loading
  } catch {
    // Render safe fallback when header mounts outside providers.
  }
  const isAdmin = profile?.role === 'admin' || profile?.role === 'business_owner'
  const { itemCount } = useCartSafe()
  const mounted = useMounted()

  useEffect(() => {
    const handler = () => {
      setCountBump(true)
      const t = setTimeout(() => setCountBump(false), 600)
      return () => clearTimeout(t)
    }
    window.addEventListener('cart-item-added', handler)
    return () => window.removeEventListener('cart-item-added', handler)
  }, [])

  if (!mounted || authLoading) {
    return (
      <div className="flex items-center space-x-4">
        <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse" />
      </div>
    )
  }

  return (
    <div className="flex items-center space-x-4">
      <Link
        href="/cart"
        data-cy="header-cart"
        className="p-2 text-text hover:text-vintage-primary transition-colors relative group"
        aria-label="Shopping cart"
      >
        <ShoppingCart className="w-5 h-5" />
        {itemCount > 0 && (
          <span className={`absolute -top-1 -right-1 bg-vintage-accent text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full shadow-sm group-hover:scale-110 transition-transform ${countBump ? 'animate-cart-bump' : ''}`}>
            {itemCount}
          </span>
        )}
      </Link>

      {user ? (
        <div className="flex items-center space-x-3" data-cy="header-user">
          {isAdmin && (
            <>
              <Link
                href="/admin/inventory"
                title="Inventory"
                aria-label="Inventory"
                className="min-w-[44px] min-h-[44px] inline-flex items-center justify-center p-2 text-text hover:text-vintage-primary transition-colors"
              >
                <Boxes className="w-5 h-5" />
              </Link>
              <Link
                href="/admin/orders"
                title="Orders"
                aria-label="Orders"
                className="min-w-[44px] min-h-[44px] inline-flex items-center justify-center p-2 text-text hover:text-vintage-primary transition-colors"
              >
                <Package className="w-5 h-5" />
              </Link>
              <Link
                href="/admin/branding"
                title="Branding & Heroes"
                aria-label="Branding & Heroes"
                className="min-w-[44px] min-h-[44px] inline-flex items-center justify-center p-2 text-text hover:text-vintage-primary transition-colors"
              >
                <ImageIcon className="w-5 h-5" />
              </Link>
            </>
          )}
          <Link
            href="/profile"
            className="min-w-[44px] min-h-[44px] inline-flex items-center justify-center p-2 text-text hover:text-vintage-primary transition-colors"
            aria-label="Profile"
            data-cy="header-profile"
          >
            <ProfileNavAvatar profile={profile} user={user} size="sm" />
          </Link>
          <button
            onClick={() => signOut()}
            className="p-2 text-text hover:text-red-600 transition-colors"
            aria-label="Sign out"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      ) : (
        <Link href="/login" className="btn btn-primary">
          Sign In
        </Link>
      )}
    </div>
  )
}
