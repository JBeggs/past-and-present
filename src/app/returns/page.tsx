import { RotateCcw, CheckCircle, XCircle, AlertCircle } from 'lucide-react'

export default function ReturnsPage() {
  return (
    <div className="min-h-screen bg-vintage-background">
      {/* Header */}
      <section className="py-12 bg-vintage-primary text-white">
        <div className="container-wide">
          <h1 className="text-3xl md:text-4xl font-bold font-playfair mb-2">
            Returns & Exchanges
          </h1>
          <p className="text-lg text-green-100">
            Our hassle-free return policy
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-12">
        <div className="container-narrow">
          {/* Policy Overview */}
          <div className="card p-8 mb-8">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-vintage-primary/10 rounded-lg flex items-center justify-center">
                <RotateCcw className="w-6 h-6 text-vintage-primary" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-text">14-Day Return Policy</h2>
                <p className="text-text-muted">Shop with confidence</p>
              </div>
            </div>
            <p className="text-text-light">
              We want you to love your purchase. If you&apos;re not completely satisfied, 
              you can return most items within 14 days of delivery for a full refund 
              or exchange.
            </p>
          </div>

          {/* What Can Be Returned */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="card p-6">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <h3 className="font-semibold text-text">Eligible for Return</h3>
              </div>
              <ul className="text-sm text-text-light space-y-2">
                <li>Items in original condition</li>
                <li>Unworn/unused items with tags</li>
                <li>Items that don&apos;t match description</li>
                <li>Damaged items (report within 48 hours)</li>
                <li>Vintage items not as described</li>
              </ul>
            </div>

            <div className="card p-6">
              <div className="flex items-center gap-2 mb-4">
                <XCircle className="w-5 h-5 text-vintage-accent" />
                <h3 className="font-semibold text-text">Not Eligible</h3>
              </div>
              <ul className="text-sm text-text-light space-y-2">
                <li>Items worn or used</li>
                <li>Items without original tags</li>
                <li>Items damaged by customer</li>
                <li>Sale items marked &quot;Final Sale&quot;</li>
                <li>Items returned after 14 days</li>
              </ul>
            </div>
          </div>

          {/* Return Process */}
          <div className="prose prose-lg max-w-none">
            <h2 className="text-2xl font-bold font-playfair text-text">How to Return</h2>
            
            <ol className="text-text-light">
              <li>
                <strong>Contact Us:</strong> Email us at returns@pastandpresent.co.za 
                with your order number and reason for return.
              </li>
              <li>
                <strong>Get Approval:</strong> We&apos;ll review your request and send you 
                a return authorization within 24 hours.
              </li>
              <li>
                <strong>Ship It Back:</strong> Pack the item securely and ship it to 
                our return address. Keep your tracking number.
              </li>
              <li>
                <strong>Receive Refund:</strong> Once we receive and inspect the item, 
                we&apos;ll process your refund within 5-7 business days.
              </li>
            </ol>

            <h2 className="text-2xl font-bold font-playfair text-text mt-8">Refund Information</h2>
            <p className="text-text-light">
              Refunds are issued to the original payment method. Please allow 5-7 business 
              days for the refund to appear in your account after we process it.
            </p>

            <h2 className="text-2xl font-bold font-playfair text-text mt-8">Exchanges</h2>
            <p className="text-text-light">
              Want a different size or color? Contact us to arrange an exchange. 
              We&apos;ll hold the new item for you while you return the original.
            </p>
          </div>

          {/* Note */}
          <div className="mt-8 p-6 bg-modern-accent/10 rounded-lg border border-modern-accent/20">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-modern-accent-dark flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-text mb-1">Note on Vintage Items</h3>
                <p className="text-sm text-text-light">
                  Vintage items are unique and may show signs of age. We describe all 
                  imperfections in our listings. Returns for vintage items are accepted 
                  only if the item significantly differs from its description.
                </p>
              </div>
            </div>
          </div>

          {/* Contact */}
          <div className="mt-8 p-6 bg-white rounded-lg border border-gray-200">
            <h3 className="font-semibold text-text mb-2">Need help with a return?</h3>
            <p className="text-text-muted mb-4">
              Our team is here to make the process easy.
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
