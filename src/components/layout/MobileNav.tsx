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

function measureHeaderBottom(): number {
  if (typeof document === 'undefined') return 0
  const header = document.getElementById('site-header')
  return header?.getBoundingClientRect().bottom ?? 0
}

function MobileNavInner({ menuItems, logoUrl: _logoUrl = '/logo.png' }: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [menuTop, setMenuTop] = useState(0)
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
    const updateMenuTop = () => setMenuTop(measureHeaderBottom())
    updateMenuTop()
    window.addEventListener('resize', updateMenuTop)
    window.addEventListener('scroll', updateMenuTop, { passive: true })
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('resize', updateMenuTop)
      window.removeEventListener('scroll', updateMenuTop)
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
    <>
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

      <div className="flex items-center gap-1">
        <Link
          href="/cart"
          data-cy="header-cart"
          data-cart-icon
          className="relative flex min-h-[44px] min-w-[44px] items-center justify-center p-2 text-text transition-colors hover:text-vintage-primary"
          aria-label={`Cart, ${itemCount} items`}
        >
          <ShoppingCart className="h-6 w-6" aria-hidden />
          {itemCount > 0 && (
            <span
              className={`absolute right-0.5 top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-vintage-accent px-1 text-[10px] font-bold text-white shadow-sm transition-transform duration-300 ${
                countBump ? 'animate-cart-bump' : ''
              }`}
            >
              {itemCount}
            </span>
          )}
        </Link>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex min-h-[44px] min-w-[44px] items-center justify-center p-2 text-text transition-colors hover:text-vintage-primary"
          aria-label="Toggle menu"
          aria-expanded={isOpen}
          aria-controls="mobile-nav-panel"
        >
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {isOpen && (
        <div
          className="fixed inset-x-0 z-[70]"
          style={{ top: menuTop, bottom: 0 }}
        >
          <button
            type="button"
            className="absolute inset-0 bg-black/30"
            aria-label="Close menu"
            onClick={() => setIsOpen(false)}
          />
          <div
            id="mobile-nav-panel"
            role="dialog"
            aria-modal="true"
            className="relative z-10 max-h-full overflow-y-auto overscroll-contain border-b border-gray-200 bg-white shadow-lg"
          >
            <nav className="container-wide py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
              <div className="flex flex-col space-y-1">
                <Link href="/" className="nav-link block py-3" onClick={() => setIsOpen(false)}>
                  Home
                </Link>
                {menuItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="nav-link block py-3"
                    onClick={() => setIsOpen(false)}
                  >
                    {item.title}
                  </Link>
                ))}

                {mounted && user ? (
                  <div className="mt-2 flex items-center gap-3 rounded-xl border border-gray-200 bg-vintage-background p-3">
                    <ProfileNavAvatar profile={profile} user={user} size="md" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-text">{displayName}</p>
                      {user.email ? (
                        <p className="truncate text-xs text-text-muted">{user.email}</p>
                      ) : null}
                    </div>
                  </div>
                ) : null}

                {isAdmin && (
                  <div className="border-t border-gray-200 pt-4 mt-2">
                    <p className="mb-2 text-xs font-bold uppercase tracking-widest text-text-muted">Business</p>
                    <Link
                      href="/admin/inventory"
                      onClick={() => setIsOpen(false)}
                      className="nav-link block py-3"
                    >
                      Inventory
                    </Link>
                    <Link
                      href="/admin/orders"
                      onClick={() => setIsOpen(false)}
                      className="nav-link block py-3"
                    >
                      Orders
                    </Link>
                    <Link
                      href="/admin/branding"
                      onClick={() => setIsOpen(false)}
                      className="nav-link block py-3"
                    >
                      Branding & Heroes
                    </Link>
                  </div>
                )}

                <div className="border-t border-gray-200 pt-4 mt-2">
                  <p className="mb-2 text-xs font-bold uppercase tracking-widest text-text-muted">Account</p>
                  {mounted && user ? (
                    <div className="space-y-1">
                      <Link
                        href="/profile"
                        className="nav-link flex items-center gap-2 py-3"
                        onClick={() => setIsOpen(false)}
                      >
                        <User className="h-5 w-5 shrink-0" />
                        <span>Profile &amp; settings</span>
                      </Link>
                      <Link href="/cart" className="nav-link block py-3" onClick={() => setIsOpen(false)}>
                        Cart{itemCount > 0 ? ` (${itemCount})` : ''}
                      </Link>
                      <button
                        type="button"
                        className="nav-link w-full py-3 text-left text-red-600"
                        onClick={() => {
                          void signOut()
                          setIsOpen(false)
                        }}
                      >
                        Sign out
                      </button>
                    </div>
                  ) : mounted ? (
                    <Link href="/login" className="btn btn-primary mt-2 inline-flex" onClick={() => setIsOpen(false)}>
                      Sign In
                    </Link>
                  ) : null}
                </div>
              </div>
            </nav>
          </div>
        </div>
      )}
    </>
  )
}

export function MobileNav(props: MobileNavProps) {
  const pathname = usePathname()
  return <MobileNavInner key={pathname} {...props} />
}
