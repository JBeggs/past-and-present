import { notFound } from 'next/navigation'
import Link from 'next/link'
import { serverEcommerceApi } from '@/lib/api-server'
import { Product } from '@/lib/types'
import { Clock, Sparkles, ArrowLeft, ShoppingCart, Truck, Shield, RotateCcw } from 'lucide-react'
import AddToCartButton from './AddToCartButton'

interface ProductPageProps {
  params: Promise<{ slug: string }>
}

async function getProduct(slug: string): Promise<Product | null> {
  try {
    const productsData = await serverEcommerceApi.products.getBySlug(slug)
    const products = Array.isArray(productsData) ? productsData : (productsData as any)?.results || []
    return products[0] || null
  } catch (error) {
    console.error('Error fetching product:', error)
    return null
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params
  const product = await getProduct(slug)

  if (!product) {
    notFound()
  }

  const isVintage = product.is_vintage
  const hasDiscount = product.compare_at_price && product.compare_at_price > product.price
  const discountPercent = hasDiscount 
    ? Math.round((1 - product.price / product.compare_at_price!) * 100)
    : 0

  return (
    <div className="min-h-screen bg-vintage-background">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200">
        <div className="container-wide py-4">
          <Link href="/products" className="flex items-center text-text-muted hover:text-vintage-primary transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Products
          </Link>
        </div>
      </div>

      {/* Product Details */}
      <section className="py-12">
        <div className="container-wide">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Product Images */}
            <div>
              <div className={`relative rounded-lg overflow-hidden ${isVintage ? 'bg-vintage-background' : 'bg-modern-background'}`}>
                {product.featured_image?.file_url ? (
                  <img
                    src={product.featured_image.file_url}
                    alt={product.name}
                    className="w-full h-auto max-h-[600px] object-contain"
                  />
                ) : (
                  <div className="w-full h-96 flex items-center justify-center">
                    {isVintage ? (
                      <Clock className="w-24 h-24 text-vintage-primary/20" />
                    ) : (
                      <Sparkles className="w-24 h-24 text-modern-primary/20" />
                    )}
                  </div>
                )}
                
                {/* Tags */}
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                  <span className={`tag ${isVintage ? 'tag-vintage' : 'tag-new'}`}>
                    {isVintage ? 'Vintage' : 'New'}
                  </span>
                  {hasDiscount && (
                    <span className="tag tag-sale">-{discountPercent}%</span>
                  )}
                </div>
              </div>

              {/* Additional Images */}
              {product.images && product.images.length > 0 && (
                <div className="grid grid-cols-4 gap-4 mt-4">
                  {product.images.slice(0, 4).map((img, index) => (
                    <div key={index} className="rounded-lg overflow-hidden bg-gray-100">
                      <img
                        src={img.media?.file_url || ''}
                        alt={`${product.name} - Image ${index + 1}`}
                        className="w-full h-24 object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div>
              <h1 className="text-3xl md:text-4xl font-bold font-playfair text-text mb-4">
                {product.name}
              </h1>

              {/* Price */}
              <div className="flex items-center gap-4 mb-6">
                <span className={`text-3xl font-bold ${isVintage ? 'text-vintage-primary' : 'text-modern-primary'}`}>
                  R{product.price.toFixed(2)}
                </span>
                {hasDiscount && (
                  <span className="text-xl text-text-muted line-through">
                    R{product.compare_at_price!.toFixed(2)}
                  </span>
                )}
              </div>

              {/* Description */}
              {product.description && (
                <p className="text-text-light mb-6">{product.description}</p>
              )}

              {/* Long Description */}
              {product.long_description && (
                <div className="prose prose-sm max-w-none mb-6" dangerouslySetInnerHTML={{ __html: product.long_description }} />
              )}

              {/* Stock Status */}
              <div className="mb-6">
                {product.quantity > 0 ? (
                  product.quantity <= 5 ? (
                    <p className="text-vintage-accent font-medium">Only {product.quantity} left in stock!</p>
                  ) : (
                    <p className="text-green-600 font-medium">In Stock</p>
                  )
                ) : (
                  <p className="text-text-muted font-medium">Out of Stock</p>
                )}
              </div>

              {/* Add to Cart */}
              <AddToCartButton product={product} />

              {/* Features */}
              <div className="grid grid-cols-3 gap-4 mt-8 pt-8 border-t border-gray-200">
                <div className="text-center">
                  <Truck className="w-6 h-6 mx-auto mb-2 text-vintage-primary" />
                  <p className="text-sm text-text-muted">Fast Shipping</p>
                </div>
                <div className="text-center">
                  <Shield className="w-6 h-6 mx-auto mb-2 text-vintage-primary" />
                  <p className="text-sm text-text-muted">Secure Payment</p>
                </div>
                <div className="text-center">
                  <RotateCcw className="w-6 h-6 mx-auto mb-2 text-vintage-primary" />
                  <p className="text-sm text-text-muted">Easy Returns</p>
                </div>
              </div>

              {/* Condition Info for Vintage */}
              {isVintage && product.condition && (
                <div className="mt-8 p-4 bg-vintage-background rounded-lg border border-vintage-primary/20">
                  <h3 className="font-semibold text-text mb-2">Condition</h3>
                  <p className="text-sm text-text-muted capitalize">{product.condition.replace('_', ' ')}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
