'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X, User, Truck, ShoppingCart } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useMounted } from '@/hooks/useMounted'
import { useCartSafe } from '@/contexts/CartContext'
import { getProfileDisplayName, ProfileNavAvatar } from '@/components/layout/ProfileNavAvatar'

interface MobileNavProps {
  menuItems: { title: string; href: string }[]
  logoUrl?: string
}

type TruckCoords = { startX: number; startY: number; endX: number; endY: number }

function MobileNavInner({ menuItems, logoUrl: _logoUrl = '/logo.png' }: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [countBump, setCountBump] = useState(false)
  const [showTruck, setShowTruck] = useState(false)
  const [truckCoords, setTruckCoords] = useState<TruckCoords | null>(null)
  const { user, profile, signOut } = useAuth()
  const isAdmin = profile?.role === 'admin' || profile?.role === 'business_owner'
  const displayName = getProfileDisplayName(profile, user)
  const { itemCount } = useCartSafe()
  const mounted = useMounted()

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<{ startX?: number; startY?: number }>)?.detail
      const startX = detail?.startX ?? window.innerWidth * 0.2
      const startY = detail?.startY ?? window.innerHeight * 0.5
      const cartEl = document.querySelector('[data-cart-icon]')
      const endRect = cartEl?.getBoundingClientRect()
      const endX = endRect ? endRect.left + endRect.width / 2 : window.innerWidth - 48
      const endY = endRect ? endRect.top + endRect.height / 2 : 48
      setTruckCoords({ startX, startY, endX, endY })
      setShowTruck(true)
      const t = setTimeout(() => {
        setShowTruck(false)
        setTruckCoords(null)
        setCountBump(true)
        const t2 = setTimeout(() => setCountBump(false), 600)
        return () => clearTimeout(t2)
      }, 1200)
      return () => clearTimeout(t)
    }
    window.addEventListener('cart-item-added', handler)
    return () => window.removeEventListener('cart-item-added', handler)
  }, [])

  useEffect(() => {
    if (!isOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [isOpen])

  return (
    <div className="md:hidden">
      {showTruck && truckCoords && (
        <div
          className="truck-fly-animation fixed pointer-events-none z-[9999]"
          style={
            {
              '--truck-start-x': `${truckCoords.startX}px`,
              '--truck-start-y': `${truckCoords.startY}px`,
              '--truck-end-x': `${truckCoords.endX}px`,
              '--truck-end-y': `${truckCoords.endY}px`,
            } as React.CSSProperties
          }
        >
          <Truck className="w-12 h-12 text-vintage-primary" strokeWidth={2} />
        </div>
      )}
      <div className="flex items-center gap-2">
        <Link
          href="/cart"
          data-cy="header-cart"
          data-cart-icon
          className="relative p-2 text-text hover:text-vintage-primary transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
          aria-label={`Cart, ${itemCount} items`}
        >
          <ShoppingCart className="w-8 h-8" aria-hidden />
          {itemCount > 0 && (
            <span
              className={`absolute -top-0.5 -right-0.5 bg-vintage-accent text-white text-xs font-bold min-w-[18px] h-[18px] flex items-center justify-center rounded-full shadow-sm transition-transform duration-300 ${
                countBump ? 'animate-cart-bump' : ''
              }`}
            >
              {itemCount}
            </span>
          )}
        </Link>
        {mounted && user ? (
          <Link
            href="/profile"
            className="relative p-2 text-text hover:text-vintage-primary transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
            aria-label="Profile"
            data-cy="mobile-header-profile"
            onClick={() => setIsOpen(false)}
          >
            <ProfileNavAvatar profile={profile} user={user} size="sm" />
          </Link>
        ) : null}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 text-text hover:text-vintage-primary transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
          aria-label="Toggle menu"
          aria-expanded={isOpen}
          aria-controls="mobile-nav-panel"
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {isOpen && (
        <div
          id="mobile-nav-panel"
          role="dialog"
          aria-modal="false"
          className="absolute top-full left-0 right-0 bg-white border-b border-gray-200 shadow-lg z-50 max-h-[calc(100dvh-5rem)] overflow-y-auto overscroll-contain"
        >
          <nav className="container-wide py-4">
            <div className="flex flex-col space-y-4">
              <Link href="/" className="nav-link py-2 block" onClick={() => setIsOpen(false)}>
                Home
              </Link>
              {menuItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="nav-link py-2 block"
                  onClick={() => setIsOpen(false)}
                >
                  {item.title}
                </Link>
              ))}
              {isAdmin && (
                <div className="border-t border-gray-200 pt-4">
                  <p className="text-xs uppercase tracking-widest text-text-muted mb-2 font-bold">Business</p>
                  <Link
                    href="/admin/inventory"
                    onClick={() => setIsOpen(false)}
                    className="nav-link py-2 block"
                  >
                    Inventory
                  </Link>
                  <Link
                    href="/admin/orders"
                    onClick={() => setIsOpen(false)}
                    className="nav-link py-2 block"
                  >
                    Orders
                  </Link>
                  <Link
                    href="/admin/branding"
                    onClick={() => setIsOpen(false)}
                    className="nav-link py-2 block"
                  >
                    Branding & Heroes
                  </Link>
                </div>
              )}
              <div className="border-t border-gray-200 pt-4">
                <p className="text-xs uppercase tracking-widest text-text-muted mb-2 font-bold">Account</p>
                {mounted && user ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-vintage-background border border-gray-200">
                      <ProfileNavAvatar profile={profile} user={user} size="md" />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-text truncate">{displayName}</p>
                        {user.email ? (
                          <p className="text-xs text-text-muted truncate">{user.email}</p>
                        ) : null}
                      </div>
                    </div>
                    <Link
                      href="/profile"
                      className="nav-link flex items-center gap-2 py-2 block"
                      onClick={() => setIsOpen(false)}
                    >
                      <User className="w-5 h-5 shrink-0" />
                      <span>Profile &amp; settings</span>
                    </Link>
                    <Link href="/cart" className="nav-link py-2 block" onClick={() => setIsOpen(false)}>
                      Cart{itemCount > 0 ? ` (${itemCount})` : ''}
                    </Link>
                    <button
                      type="button"
                      className="w-full text-left nav-link py-2 text-red-600"
                      onClick={() => {
                        void signOut()
                        setIsOpen(false)
                      }}
                    >
                      Sign out
                    </button>
                  </div>
                ) : mounted ? (
                  <Link href="/login" className="btn btn-primary" onClick={() => setIsOpen(false)}>
                    Sign In
                  </Link>
                ) : null}
              </div>
            </div>
          </nav>
        </div>
      )}
    </div>
  )
}

export function MobileNav(props: MobileNavProps) {
  const pathname = usePathname()
  return <MobileNavInner key={pathname} {...props} />
}
