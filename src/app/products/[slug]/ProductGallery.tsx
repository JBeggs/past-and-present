'use client'

import { useState } from 'react'
import { Product } from '@/lib/types'
import { Clock, Sparkles } from 'lucide-react'

interface ProductGalleryProps {
  product: Product
}

export default function ProductGallery({ product }: ProductGalleryProps) {
  const allImages = [
    product.featured_image?.file_url || product.image,
    ...(Array.isArray(product.images) ? product.images.map(img => {
      if (typeof img === 'string') return img;
      return img.media?.file_url || (img as any).url || (img as any).image || '';
    }) : [])
  ].filter(Boolean) as string[]

  const [activeImage, setActiveImage] = useState(allImages[0] || '')
  const isVintage = Array.isArray(product.tags) && product.tags.some(t => (typeof t === 'string' ? t : t.name) === 'vintage')

  if (allImages.length === 0) {
    return (
      <div className="w-full h-96 bg-gray-100 rounded-2xl flex items-center justify-center border border-gray-200">
        {isVintage ? (
          <Clock className="w-24 h-24 text-vintage-primary/20" />
        ) : (
          <Sparkles className="w-24 h-24 text-modern-primary/20" />
        )}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div className="relative aspect-[4/5] rounded-2xl overflow-hidden bg-white border border-gray-100 shadow-sm group">
        <img
          src={activeImage}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          <span className={`tag ${isVintage ? 'tag-vintage' : 'tag-new'} shadow-md`}>
            {isVintage ? 'Vintage' : 'New'}
          </span>
          {product.featured && (
            <span className="tag tag-featured shadow-md">Featured</span>
          )}
        </div>
      </div>

      {/* Thumbnails */}
      {allImages.length > 1 && (
        <div className="grid grid-cols-5 gap-3">
          {allImages.map((img, index) => (
            <button
              key={index}
              onClick={() => setActiveImage(img)}
              className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                activeImage === img 
                  ? 'border-vintage-primary shadow-md scale-95' 
                  : 'border-transparent hover:border-gray-300 opacity-70 hover:opacity-100'
              }`}
            >
              <img
                src={img}
                alt={`${product.name} thumbnail ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
