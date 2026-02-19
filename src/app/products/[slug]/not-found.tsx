import Link from 'next/link'

export default function ProductNotFound() {
  return (
    <div className="min-h-screen bg-vintage-background flex items-center justify-center py-12">
      <div className="text-center">
        <h1 className="text-4xl font-bold font-playfair text-text mb-4">Product Not Found</h1>
        <p className="text-text-muted mb-8">
          Sorry, we couldn&apos;t find the product you&apos;re looking for.
        </p>
        <Link href="/products" className="btn btn-primary">
          Browse All Products
        </Link>
      </div>
    </div>
  )
}
