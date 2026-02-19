'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Menu, X, ShoppingCart, User } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

interface MobileNavProps {
  menuItems: { title: string; href: string }[]
}

export function MobileNav({ menuItems }: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false)
  const { user } = useAuth()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const id = setTimeout(() => setMounted(true), 0)
    return () => clearTimeout(id)
  }, [])

  return (
    <div className="md:hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-text hover:text-vintage-primary transition-colors"
        aria-label="Toggle menu"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

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
                {mounted && user && (
                  <Link
                    href="/cart"
                    className="flex items-center space-x-2 nav-link"
                    onClick={() => setIsOpen(false)}
                  >
                    <ShoppingCart className="w-5 h-5" />
                    <span>Cart</span>
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
