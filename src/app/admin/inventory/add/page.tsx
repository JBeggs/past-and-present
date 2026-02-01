'use client'

import { useRouter } from 'next/navigation'
import ProductForm from '@/components/products/ProductForm'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { useEffect } from 'react'
import { Loader2 } from 'lucide-react'

export default function AddProductPage() {
  const router = useRouter()
  const { profile, loading: authLoading } = useAuth()

  // Authorization check
  const isAuthorized = profile?.role === 'admin' || profile?.role === 'business_owner'

  useEffect(() => {
    if (!authLoading && !isAuthorized) {
      router.push('/login')
    }
  }, [isAuthorized, authLoading, router])

  if (authLoading || !isAuthorized) {
    return (
      <div className="min-h-screen bg-vintage-background flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-vintage-primary opacity-50" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-vintage-background">
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="container-wide py-4 flex items-center gap-4">
          <Link href="/admin/inventory" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <ArrowLeft className="w-6 h-6 text-text-light" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold font-playfair text-text">Add New Product</h1>
            <p className="text-xs text-text-muted uppercase tracking-widest font-bold">Store Admin</p>
          </div>
        </div>
      </div>

      <div className="container-narrow py-8">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100">
          <ProductForm 
            onClose={() => router.push('/admin/inventory')} 
            onSuccess={() => router.push('/admin/inventory')}
            inline={true}
          />
        </div>
      </div>
    </div>
  )
}
