'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ecommerceApi } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/contexts/ToastContext'
import { Cart } from '@/lib/types'
import { ArrowLeft, CreditCard, Truck, Shield, Lock } from 'lucide-react'

export default function CheckoutPage() {
  const [cart, setCart] = useState<Cart | null>(null)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const { user, profile } = useAuth()
  const { showError, showSuccess } = useToast()
  const router = useRouter()

  const [formData, setFormData] = useState({
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    shipping_address_line1: '',
    shipping_address_line2: '',
    shipping_city: '',
    shipping_state: '',
    shipping_postal_code: '',
    shipping_country: 'South Africa',
    customer_notes: '',
  })

  useEffect(() => {
    fetchCart()
    // Pre-fill form with user data
    if (profile) {
      setFormData(prev => ({
        ...prev,
        customer_name: profile.full_name || '',
        customer_email: profile.email || '',
      }))
    }
  }, [profile])

  const fetchCart = async () => {
    try {
      const data = await ecommerceApi.cart.get() as Cart
      setCart(data)
      if (!data.items || data.items.length === 0) {
        router.push('/cart')
      }
    } catch (error) {
      console.error('Error fetching cart:', error)
      router.push('/cart')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setProcessing(true)

    try {
      // Create order
      const order = await ecommerceApi.checkout.initiate({
        ...formData,
        billing_same_as_shipping: true,
      }) as any

      // Create Yoco checkout
      const checkout = await ecommerceApi.payments.createCheckout(order.id) as any

      if (checkout.redirectUrl) {
        // Redirect to Yoco payment page
        window.location.href = checkout.redirectUrl
      } else {
        showError('Failed to create payment session')
      }
    } catch (error: any) {
      showError(error.message || 'Failed to process checkout')
    } finally {
      setProcessing(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-vintage-background py-12">
        <div className="container-wide">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-48 mb-8" />
            <div className="grid lg:grid-cols-2 gap-8">
              <div className="h-96 bg-gray-200 rounded" />
              <div className="h-64 bg-gray-200 rounded" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-vintage-background py-12">
      <div className="container-wide">
        {/* Back Link */}
        <Link href="/cart" className="flex items-center text-text-muted hover:text-vintage-primary transition-colors mb-8">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Cart
        </Link>

        <h1 className="text-3xl font-bold font-playfair text-text mb-8">Checkout</h1>

        <form onSubmit={handleSubmit}>
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Checkout Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Contact Information */}
              <div className="card p-6">
                <h2 className="text-lg font-semibold text-text mb-4">Contact Information</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="customer_name" className="form-label">Full Name *</label>
                    <input
                      id="customer_name"
                      type="text"
                      value={formData.customer_name}
                      onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                      className="form-input"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="customer_email" className="form-label">Email *</label>
                    <input
                      id="customer_email"
                      type="email"
                      value={formData.customer_email}
                      onChange={(e) => setFormData({ ...formData, customer_email: e.target.value })}
                      className="form-input"
                      required
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label htmlFor="customer_phone" className="form-label">Phone</label>
                    <input
                      id="customer_phone"
                      type="tel"
                      value={formData.customer_phone}
                      onChange={(e) => setFormData({ ...formData, customer_phone: e.target.value })}
                      className="form-input"
                    />
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              <div className="card p-6">
                <h2 className="text-lg font-semibold text-text mb-4 flex items-center gap-2">
                  <Truck className="w-5 h-5" />
                  Shipping Address
                </h2>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="shipping_address_line1" className="form-label">Address Line 1 *</label>
                    <input
                      id="shipping_address_line1"
                      type="text"
                      value={formData.shipping_address_line1}
                      onChange={(e) => setFormData({ ...formData, shipping_address_line1: e.target.value })}
                      className="form-input"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="shipping_address_line2" className="form-label">Address Line 2</label>
                    <input
                      id="shipping_address_line2"
                      type="text"
                      value={formData.shipping_address_line2}
                      onChange={(e) => setFormData({ ...formData, shipping_address_line2: e.target.value })}
                      className="form-input"
                    />
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="shipping_city" className="form-label">City *</label>
                      <input
                        id="shipping_city"
                        type="text"
                        value={formData.shipping_city}
                        onChange={(e) => setFormData({ ...formData, shipping_city: e.target.value })}
                        className="form-input"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="shipping_state" className="form-label">Province</label>
                      <input
                        id="shipping_state"
                        type="text"
                        value={formData.shipping_state}
                        onChange={(e) => setFormData({ ...formData, shipping_state: e.target.value })}
                        className="form-input"
                      />
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="shipping_postal_code" className="form-label">Postal Code *</label>
                      <input
                        id="shipping_postal_code"
                        type="text"
                        value={formData.shipping_postal_code}
                        onChange={(e) => setFormData({ ...formData, shipping_postal_code: e.target.value })}
                        className="form-input"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="shipping_country" className="form-label">Country</label>
                      <input
                        id="shipping_country"
                        type="text"
                        value={formData.shipping_country}
                        className="form-input bg-gray-50"
                        disabled
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Notes */}
              <div className="card p-6">
                <h2 className="text-lg font-semibold text-text mb-4">Order Notes (Optional)</h2>
                <textarea
                  value={formData.customer_notes}
                  onChange={(e) => setFormData({ ...formData, customer_notes: e.target.value })}
                  className="form-input resize-none"
                  rows={3}
                  placeholder="Any special instructions for your order..."
                />
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="card p-6 sticky top-24">
                <h2 className="text-lg font-semibold text-text mb-4">Order Summary</h2>
                
                {/* Items */}
                <div className="space-y-3 mb-4">
                  {cart?.items?.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-text-muted">
                        {item.product?.name || 'Product'} x {item.quantity}
                      </span>
                      <span className="font-medium">R{(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                <div className="divider my-4" />

                {/* Totals */}
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-text-muted">Subtotal</span>
                    <span className="font-medium">R{cart?.subtotal?.toFixed(2) || '0.00'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-muted">Shipping</span>
                    <span className="font-medium">
                      {cart?.shipping ? `R${cart.shipping.toFixed(2)}` : 'Calculated'}
                    </span>
                  </div>
                  <div className="divider my-4" />
                  <div className="flex justify-between text-lg">
                    <span className="font-semibold">Total</span>
                    <span className="font-bold text-vintage-primary">
                      R{cart?.total?.toFixed(2) || cart?.subtotal?.toFixed(2) || '0.00'}
                    </span>
                  </div>
                </div>

                {/* Payment Button */}
                <button
                  type="submit"
                  disabled={processing}
                  className="btn btn-primary w-full mt-6 py-3"
                >
                  <CreditCard className="w-5 h-5 mr-2" />
                  {processing ? 'Processing...' : 'Pay with Yoco'}
                </button>

                {/* Security Note */}
                <div className="mt-4 flex items-center justify-center gap-2 text-sm text-text-muted">
                  <Lock className="w-4 h-4" />
                  <span>Secure payment powered by Yoco</span>
                </div>

                {/* Trust Badges */}
                <div className="mt-6 pt-6 border-t border-gray-200 grid grid-cols-2 gap-4 text-center text-xs text-text-muted">
                  <div>
                    <Shield className="w-5 h-5 mx-auto mb-1" />
                    <span>Secure Checkout</span>
                  </div>
                  <div>
                    <Truck className="w-5 h-5 mx-auto mb-1" />
                    <span>Fast Delivery</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
