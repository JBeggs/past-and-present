'use client'

import Link from 'next/link'
import { Product } from '@/lib/types'
import { Clock, Sparkles, Edit2, Trash2 } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { ecommerceApi } from '@/lib/api'
import { useToast } from '@/contexts/ToastContext'
import { useRouter } from 'next/navigation'

interface ProductCardProps {
  product: Product
}

export default function ProductCard({ product }: ProductCardProps) {
  const { profile } = useAuth()
  const { showSuccess, showError } = useToast()
  const router = useRouter()
  const isAuthorized = profile?.role === 'admin' || profile?.role === 'business_owner'
  const isVintage = Array.isArray(product.tags) && product.tags.some(t => (typeof t === 'string' ? t : t.name) === 'vintage')

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (!confirm(`Are you sure you want to delete "${product.name}"?`)) return

    try {
      await ecommerceApi.products.delete(product.id)
      showSuccess('Product deleted successfully')
      router.refresh()
    } catch (error) {
      console.error('Error deleting product:', error)
      showError('Failed to delete product')
    }
  }

  return (
    <div className="h-full">
      <div className={`${isVintage ? 'product-card-vintage' : 'product-card-modern'} group relative h-full flex flex-col`}>
        <div className="relative overflow-hidden aspect-square">
          <Link
            href={`/products/${product.slug}`}
            className="absolute inset-0 z-0"
            prefetch={false}
          >
{product.image ? (
                <img
                src={product.image}
                alt={product.name}
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                {isVintage ? (
                  <Clock className="w-12 h-12 text-vintage-primary/30" />
                ) : (
                  <Sparkles className="w-12 h-12 text-modern-primary/30" />
                )}
              </div>
            )}
          </Link>
          
          <span className={`tag ${isVintage ? 'tag-vintage' : 'tag-new'} absolute top-2 left-2 z-10 pointer-events-none`}>
            {isVintage ? 'Vintage' : 'New'}
          </span>
          
          {product.compare_at_price && product.compare_at_price > product.price && (
            <span className="tag tag-sale absolute top-2 right-2 z-10 pointer-events-none">Sale</span>
          )}

          {product.featured && (
            <span className="tag tag-featured absolute top-10 right-2 z-10 pointer-events-none shadow-sm">Featured</span>
          )}

          {/* Admin Actions Overlay */}
          {isAuthorized && (
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 z-20">
              <Link
                href={`/admin/inventory/edit/${product.id}`}
                className="bg-white p-2 rounded-full text-vintage-primary hover:bg-vintage-primary hover:text-white transition-all shadow-lg"
                title="Edit Product"
                prefetch={false}
              >
                <Edit2 className="w-5 h-5" />
              </Link>
              <button
                onClick={handleDelete}
                className="bg-white p-2 rounded-full text-vintage-accent hover:bg-vintage-accent hover:text-white transition-all shadow-lg"
                title="Delete Product"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
        
        <div className="p-4 flex-1 flex flex-col">
          <Link href={`/products/${product.slug}`} className="group/title" prefetch={false}>
            <h3 className={`font-semibold text-text group-hover/title:${isVintage ? 'text-vintage-primary' : 'text-modern-primary'} transition-colors line-clamp-1`}>
              {product.name}
            </h3>
          </Link>
          {product.description && (
            <p className="text-sm text-text-muted mt-1 line-clamp-2 min-h-[40px]">{product.description}</p>
          )}
          <div className="mt-auto pt-3 flex items-center gap-2">
            <span className={`price ${isVintage ? '' : 'text-modern-primary'}`}>
              R{Number(product.price).toFixed(2)}
            </span>
            {product.compare_at_price && Number(product.compare_at_price) > Number(product.price) && (
              <span className="price-original">R{Number(product.compare_at_price).toFixed(2)}</span>
            )}
          </div>
          {product.quantity <= 5 && product.quantity > 0 && (
            <p className="text-sm text-vintage-accent mt-2 font-medium">Only {product.quantity} left!</p>
          )}
          {product.quantity === 0 && (
            <p className="text-sm text-text-muted mt-2">Out of stock</p>
          )}
        </div>
      </div>
    </div>
  )
}
