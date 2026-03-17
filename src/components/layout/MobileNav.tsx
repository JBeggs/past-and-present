'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Menu, X, User, Truck } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useMounted } from '@/hooks/useMounted'
import { useCartSafe } from '@/contexts/CartContext'

interface MobileNavProps {
  menuItems: { title: string; href: string }[]
  logoUrl?: string
}

export function MobileNav({ menuItems, logoUrl = '/logo.png' }: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [countBump, setCountBump] = useState(false)
  const [showTruck, setShowTruck] = useState(false)
  const { user } = useAuth()
  const { itemCount } = useCartSafe()
  const mounted = useMounted()

  useEffect(() => {
    const handler = () => {
      setShowTruck(true)
      const t = setTimeout(() => {
        setShowTruck(false)
        setCountBump(true)
        const t2 = setTimeout(() => setCountBump(false), 600)
        return () => clearTimeout(t2)
      }, 1200)
      return () => clearTimeout(t)
    }
    window.addEventListener('cart-item-added', handler)
    return () => window.removeEventListener('cart-item-added', handler)
  }, [])

  return (
    <div className="md:hidden">
      {showTruck && (
        <div className="fixed inset-0 pointer-events-none z-[9999] flex items-center justify-end pr-16 pt-20">
          <div className="truck-fly-animation">
            <Truck className="w-12 h-12 text-vintage-primary" strokeWidth={2} />
          </div>
        </div>
      )}
      <div className="flex items-center gap-2">
      <Link
        href="/cart"
        data-cy="header-cart"
        data-cart-icon
        className="relative p-2 text-text hover:text-vintage-primary transition-colors"
        aria-label={`Cart, ${itemCount} items`}
      >
        {logoUrl ? (
          <span className="relative block w-8 h-8">
            <img src={logoUrl} alt="" className="w-full h-full object-contain" aria-hidden />
          </span>
        ) : (
          <Truck className="w-8 h-8" aria-hidden />
        )}
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
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-text hover:text-vintage-primary transition-colors"
        aria-label="Toggle menu"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 bg-white border-b border-gray-200 shadow-lg z-50">
          <nav className="container-wide py-4">
            <div className="flex flex-col space-y-4">
              <Link
                href="/"
                className="nav-link py-2"
                onClick={() => setIsOpen(false)}
              >
                Home
              </Link>
              {menuItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="nav-link py-2"
                  onClick={() => setIsOpen(false)}
                >
                  {item.title}
                </Link>
              ))}
              <div className="border-t border-gray-200 pt-4 flex items-center space-x-4">
                {mounted && (
                  <Link
                    href="/cart"
                    className="flex items-center space-x-2 nav-link"
                    onClick={() => setIsOpen(false)}
                  >
                    <span className="font-semibold">Cart{itemCount > 0 ? ` (${itemCount})` : ''}</span>
                  </Link>
                )}
                {mounted && user ? (
                  <Link
                    href="/profile"
                    className="flex items-center space-x-2 nav-link"
                    onClick={() => setIsOpen(false)}
                  >
                    <User className="w-5 h-5" />
                    <span>Profile</span>
                  </Link>
                ) : mounted ? (
                  <Link
                    href="/login"
                    className="btn btn-primary"
                    onClick={() => setIsOpen(false)}
                  >
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
