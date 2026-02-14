'use client'

import { useState, useEffect } from 'react'
import { ecommerceApi } from '@/lib/api'
import { Product } from '@/lib/types'
import { X, Edit2, Trash2, Loader2, Search, ExternalLink, Package, AlertCircle, Image as ImageIcon, ArrowLeft, Plus, Settings, Filter } from 'lucide-react'
import { useToast } from '@/contexts/ToastContext'
import ProductForm from '@/components/products/ProductForm'
import CategoryManager from '@/components/products/CategoryManager'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'

export default function InventoryPage() {
  const { profile, loading: authLoading } = useAuth()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [isProductModalOpen, setIsProductModalOpen] = useState(false)
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const { showSuccess, showError } = useToast()
  const router = useRouter()

  // Authorization check
  const isAuthorized = profile?.role === 'admin' || profile?.role === 'business_owner'

  useEffect(() => {
    if (!authLoading && !isAuthorized) {
      router.push('/login')
    }
  }, [isAuthorized, authLoading, router])

  useEffect(() => {
    if (isAuthorized) {
      fetchProducts()
    }
  }, [isAuthorized])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const response: any = await ecommerceApi.products.listForAdmin()
      const productData = response?.data || (Array.isArray(response) ? response : response?.results || [])
      setProducts(productData)
    } catch (error) {
      console.error('Error fetching products:', error)
      showError('Failed to load products')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (product: Product) => {
    if (!confirm(`Are you sure you want to delete "${product.name}"?`)) return

    try {
      await ecommerceApi.products.delete(product.id)
      showSuccess('Product deleted successfully')
      fetchProducts()
    } catch (error) {
      console.error('Error deleting product:', error)
      showError('Failed to delete product')
    }
  }

  const filteredProducts = products.filter(p => {
    if (p.status === 'archived') return false
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         p.sku?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-100 text-green-700 uppercase">Active</span>
      case 'draft':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-yellow-100 text-yellow-700 uppercase">Draft</span>
      case 'archived':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-gray-700 uppercase">Archived</span>
      default:
        return null
    }
  }

  if (authLoading || !isAuthorized) {
    return (
      <div className="min-h-screen bg-vintage-background flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-vintage-primary opacity-50" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-vintage-background pb-20">
      {/* Header Area */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="container-wide py-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Link href="/products" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <ArrowLeft className="w-6 h-6 text-text-light" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold font-playfair text-text">Inventory Management</h1>
                <p className="text-xs text-text-muted uppercase tracking-widest font-bold">Store Admin</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsCategoryModalOpen(true)}
                className="btn btn-secondary btn-sm flex items-center gap-2"
              >
                <Settings className="w-4 h-4" />
                Categories
              </button>
              <button
                onClick={() => setIsProductModalOpen(true)}
                className="btn btn-primary btn-sm flex items-center gap-2 shadow-lg shadow-vintage-primary/20"
              >
                <Plus className="w-4 h-4" />
                Add Product
              </button>
            </div>
          </div>
        </div>

        {/* Search & Filters Bar */}
        <div className="bg-gray-50 border-t border-gray-100">
          <div className="container-wide py-3">
            <div className="flex flex-col md:flex-row items-center gap-4">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input
                  type="text"
                  placeholder="Search by name or SKU..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg focus:ring-4 focus:ring-vintage-primary/10 outline-none transition-all text-sm"
                />
              </div>
              
              <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
                <Filter className="w-4 h-4 text-text-muted flex-shrink-0" />
                <div className="flex gap-1">
                  {['all', 'active', 'draft'].map((status) => (
                    <button
                      key={status}
                      onClick={() => setStatusFilter(status)}
                      className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all ${
                        statusFilter === status 
                          ? 'bg-vintage-primary text-white' 
                          : 'bg-white text-text-muted border border-gray-200 hover:border-vintage-primary/30'
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>

              <div className="hidden lg:flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-text-muted border-l border-gray-200 pl-4">
                <div className="flex flex-col items-center">
                  <span className="text-text text-sm">{products.filter(p => p.status !== 'archived').length}</span>
                  <span>Total</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-green-600 text-sm">{products.filter(p => p.status === 'active').length}</span>
                  <span>Active</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-yellow-600 text-sm">{products.filter(p => p.status === 'draft').length}</span>
                  <span>Drafts</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container-wide py-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 opacity-50">
            <Loader2 className="w-12 h-12 animate-spin text-vintage-primary mb-4" />
            <p className="font-bold text-text uppercase tracking-widest text-xs">Syncing Inventory...</p>
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
            {filteredProducts.map((product) => (
              <div 
                key={product.id} 
                className="flex items-center gap-3 p-3 bg-white border border-gray-100 rounded-xl hover:border-vintage-primary/30 hover:shadow-md transition-all group relative overflow-hidden"
              >
                {/* Status indicator line */}
                <div className={`absolute left-0 top-0 bottom-0 w-1 ${
                  product.status === 'active' ? 'bg-green-500' : 
                  product.status === 'draft' ? 'bg-yellow-500' : 'bg-gray-400'
                }`} />

                {/* Thumbnail - Compact on mobile */}
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-50 rounded-lg overflow-hidden border border-gray-100 flex-shrink-0 shadow-inner">
                  {product.image ? (
                    <img src={product.image} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-200">
                      <ImageIcon className="w-6 h-6 sm:w-8 sm:h-8" />
                    </div>
                  )}
                </div>

                {/* Info - More compact layout */}
                <div className="flex-1 min-w-0 py-1">
                  <div className="flex flex-col mb-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-sm sm:text-lg text-text truncate group-hover:text-vintage-primary transition-colors">
                        {product.name}
                      </h3>
                      {getStatusBadge(product.status)}
                      {product.featured && (
                        <span className="px-1.5 py-0.5 rounded-full text-[8px] sm:text-[10px] font-bold bg-purple-100 text-purple-700 uppercase tracking-tighter">Featured</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 sm:gap-6 text-[10px] sm:text-xs">
                    <div className="flex flex-col">
                      <span className="text-text-muted font-bold text-[8px] uppercase tracking-wider">Price</span>
                      <span className="font-bold text-text">R{Number(product.price).toFixed(2)}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-text-muted font-bold text-[8px] uppercase tracking-wider">Stock</span>
                      <span className={`font-bold ${(product.stock_quantity || 0) <= 5 ? 'text-vintage-accent' : 'text-text-light'}`}>
                        {product.stock_quantity ?? 0} <span className="hidden sm:inline">units</span>
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-text-muted font-bold text-[8px] uppercase tracking-wider">Condition</span>
                      <span className="font-medium text-text-light capitalize">
                        {Array.isArray(product.tags) && product.tags.some(t => (typeof t === 'string' ? t : t.name) === 'vintage') ? 'Vintage' : 'New'}
                      </span>
                    </div>
                    <div className="hidden md:flex flex-col">
                      <span className="text-text-muted font-bold text-[8px] uppercase tracking-wider">SKU</span>
                      <span className="font-mono text-text-light">{product.sku || '---'}</span>
                    </div>
                  </div>
                </div>

                {/* Actions - Compact on mobile */}
                <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 sm:border-l sm:border-gray-100 sm:pl-3">
                  <Link 
                    href={`/admin/inventory/edit/${product.id}`}
                    className="p-2 text-text-muted hover:text-vintage-primary hover:bg-vintage-primary/5 rounded-lg transition-all"
                    title="Edit"
                  >
                    <Edit2 className="w-4 h-4 sm:w-5 sm:h-5" />
                  </Link>
                  <button 
                    onClick={() => handleDelete(product)}
                    className="p-2 text-text-muted hover:text-vintage-accent hover:bg-vintage-accent/5 rounded-lg transition-all"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                  <a 
                    href={`/products/${product.slug}`} 
                    target="_blank"
                    className="hidden sm:flex p-2 text-text-muted hover:text-vintage-primary hover:bg-vintage-primary/5 rounded-lg transition-all"
                    title="View Public Page"
                  >
                    <ExternalLink className="w-4 h-4 sm:w-5 sm:h-5" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-32 text-center bg-white rounded-3xl border border-dashed border-gray-200">
            <div className="p-6 bg-gray-50 rounded-full mb-6 text-gray-300 shadow-inner">
              <AlertCircle className="w-16 h-16" />
            </div>
            <h3 className="text-xl font-bold text-text">No products found</h3>
            <p className="text-text-muted max-w-xs mx-auto mt-2">
              {searchQuery || statusFilter !== 'all' 
                ? "We couldn't find any products matching your current filters." 
                : "You haven't added any products to your inventory yet."}
            </p>
            {(searchQuery || statusFilter !== 'all') && (
              <button 
                onClick={() => {setSearchQuery(''); setStatusFilter('all')}}
                className="mt-6 text-vintage-primary font-bold hover:underline"
              >
                Clear all filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      {isProductModalOpen && (
        <ProductForm 
          onClose={() => setIsProductModalOpen(false)} 
          onSuccess={() => fetchProducts()}
        />
      )}
      {editingProduct && (
        <ProductForm 
          product={editingProduct} 
          onClose={() => setEditingProduct(null)} 
          onSuccess={() => fetchProducts()}
        />
      )}
      {isCategoryModalOpen && (
        <CategoryManager onClose={() => setIsCategoryModalOpen(false)} />
      )}
    </div>
  )
}
