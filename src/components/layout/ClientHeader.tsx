'use client'

import Link from 'next/link'
import { ShoppingCart, User, LogOut } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

export default function ClientHeader() {
  const { user, signOut, loading } = useAuth()

  if (loading) {
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
        className="p-2 text-text hover:text-vintage-primary transition-colors relative"
        aria-label="Shopping cart"
      >
        <ShoppingCart className="w-5 h-5" />
      </Link>

      {user ? (
        <div className="flex items-center space-x-3">
          <Link
            href="/profile"
            className="p-2 text-text hover:text-vintage-primary transition-colors"
            aria-label="Profile"
          >
            <User className="w-5 h-5" />
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
