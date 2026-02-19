'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Plus, Settings, Package, ShoppingBag } from 'lucide-react'
import ProductForm from './ProductForm'
import CategoryManager from './CategoryManager'
import Link from 'next/link'

export default function AdminActions() {
  const { profile } = useAuth()
  const [isProductModalOpen, setIsProductModalOpen] = useState(false)
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false)

  // Only show for admin or business_owner
  const isAuthorized = profile?.role === 'admin' || profile?.role === 'business_owner'

  if (!isAuthorized) return null

  return (
    <div className="bg-white border-b border-gray-200 py-4 mb-6 sticky top-[73px] z-40 shadow-sm">
      <div className="container-wide">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-1 md:pb-0">
            <h2 className="text-[10px] md:text-sm font-bold uppercase tracking-wider text-text-light whitespace-nowrap">Store Management</h2>
            <div className="hidden md:block h-4 w-px bg-gray-300 mx-2"></div>
            <Link
              href="/admin/inventory"
              className="btn btn-secondary btn-sm flex items-center gap-2 whitespace-nowrap py-1.5 px-3"
            >
              <Package className="w-4 h-4" />
              Inventory
            </Link>
            <Link
              href="/admin/orders"
              className="btn btn-secondary btn-sm flex items-center gap-2 whitespace-nowrap py-1.5 px-3"
            >
              <ShoppingBag className="w-4 h-4" />
              Orders
            </Link>
            <Link
              href="/admin/inventory/add"
              className="btn btn-primary btn-sm flex items-center gap-2 whitespace-nowrap py-1.5 px-3"
            >
              <Plus className="w-4 h-4" />
              Add Product
            </Link>
            <button
              onClick={() => setIsCategoryModalOpen(true)}
              className="btn btn-secondary btn-sm flex items-center gap-2 whitespace-nowrap py-1.5 px-3"
            >
              <Settings className="w-4 h-4" />
              Categories
            </button>
          </div>
          <div className="hidden md:block text-xs text-text-muted">
            Logged in as <span className="font-semibold text-vintage-primary">{profile?.role}</span>
          </div>
        </div>
      </div>

      {isProductModalOpen && (
        <ProductForm onClose={() => setIsProductModalOpen(false)} />
      )}
      {isCategoryModalOpen && (
        <CategoryManager onClose={() => setIsCategoryModalOpen(false)} />
      )}
    </div>
  )
}
