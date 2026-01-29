import { Truck, Clock, MapPin, Package } from 'lucide-react'

export default function ShippingPage() {
  return (
    <div className="min-h-screen bg-vintage-background">
      {/* Header */}
      <section className="py-12 bg-vintage-primary text-white">
        <div className="container-wide">
          <h1 className="text-3xl md:text-4xl font-bold font-playfair mb-2">
            Shipping Information
          </h1>
          <p className="text-lg text-green-100">
            Everything you need to know about delivery
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-12">
        <div className="container-narrow">
          {/* Shipping Options */}
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            <div className="card p-6">
              <div className="w-12 h-12 bg-vintage-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Truck className="w-6 h-6 text-vintage-primary" />
              </div>
              <h3 className="text-lg font-semibold text-text mb-2">Standard Shipping</h3>
              <p className="text-text-muted mb-4">3-5 business days</p>
              <ul className="text-sm text-text-light space-y-2">
                <li>Free on orders over R500</li>
                <li>R65 for orders under R500</li>
                <li>Tracking included</li>
              </ul>
            </div>

            <div className="card p-6">
              <div className="w-12 h-12 bg-modern-accent/10 rounded-lg flex items-center justify-center mb-4">
                <Clock className="w-6 h-6 text-modern-accent-dark" />
              </div>
              <h3 className="text-lg font-semibold text-text mb-2">Express Shipping</h3>
              <p className="text-text-muted mb-4">1-2 business days</p>
              <ul className="text-sm text-text-light space-y-2">
                <li>R120 flat rate</li>
                <li>Priority handling</li>
                <li>Real-time tracking</li>
              </ul>
            </div>
          </div>

          {/* Shipping Details */}
          <div className="prose prose-lg max-w-none">
            <h2 className="text-2xl font-bold font-playfair text-text">Delivery Areas</h2>
            <p className="text-text-light">
              We currently ship to all major cities and towns within South Africa. 
              Delivery times may vary for remote areas.
            </p>

            <h2 className="text-2xl font-bold font-playfair text-text mt-8">Order Processing</h2>
            <p className="text-text-light">
              Orders placed before 2pm on business days are processed the same day. 
              Orders placed after 2pm or on weekends will be processed the next business day.
            </p>

            <h2 className="text-2xl font-bold font-playfair text-text mt-8">Tracking Your Order</h2>
            <p className="text-text-light">
              Once your order ships, you'll receive an email with your tracking number. 
              You can track your package directly through our courier partner's website.
            </p>

            <h2 className="text-2xl font-bold font-playfair text-text mt-8">Packaging</h2>
            <p className="text-text-light">
              We take extra care with vintage items. All products are carefully wrapped 
              and packaged to ensure they arrive safely. We use eco-friendly packaging 
              materials whenever possible.
            </p>
          </div>

          {/* Contact */}
          <div className="mt-12 p-6 bg-white rounded-lg border border-gray-200">
            <h3 className="font-semibold text-text mb-2">Questions about shipping?</h3>
            <p className="text-text-muted mb-4">
              Contact our team for assistance with delivery inquiries.
            </p>
            <a href="/contact" className="btn btn-primary">
              Contact Us
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}
