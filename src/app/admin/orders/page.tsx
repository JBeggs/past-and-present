'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ecommerceApi } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/contexts/ToastContext'
import {
  ArrowLeft,
  Package,
  Truck,
  Loader2,
  Filter,
} from 'lucide-react'

interface Order {
  id: string
  order_number: string
  status: string
  payment_status: string
  total: number
  shipping: number
  delivery_method: string
  waybill_number?: string
  tracking_number?: string
  created_at: string
  paid_at?: string
  customer_email?: string
  customer_first_name?: string
  customer_last_name?: string
}

export default function AdminOrdersPage() {
  const { profile, loading: authLoading } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [creatingShipment, setCreatingShipment] = useState<string | null>(null)
  const { showSuccess, showError } = useToast()

  const isAuthorized = profile?.role === 'admin' || profile?.role === 'business_owner'

  useEffect(() => {
    if (!authLoading && !isAuthorized) {
      window.location.href = '/login'
    }
  }, [isAuthorized, authLoading])

  useEffect(() => {
    if (isAuthorized) {
      fetchOrders()
    }
  }, [isAuthorized])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const response: any = await ecommerceApi.orders.list()
      const orderData = response?.data || (Array.isArray(response) ? response : response?.results || [])
      setOrders(Array.isArray(orderData) ? orderData : [])
    } catch (error) {
      console.error('Error fetching orders:', error)
      showError('Failed to load orders')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateShipment = async (orderId: string) => {
    setCreatingShipment(orderId)
    try {
      await ecommerceApi.orders.createShipment(orderId)
      showSuccess('Shipment created successfully')
      fetchOrders()
    } catch (error: any) {
      const msg = error?.details?.error?.message || error?.message || 'Failed to create shipment'
      showError(msg)
    } finally {
      setCreatingShipment(null)
    }
  }

  const filteredOrders = orders.filter((o) => {
    if (statusFilter === 'all') return true
    return o.status === statusFilter
  })

  const canCreateShipment = (order: Order) =>
    (order.status === 'paid' || order.status === 'processing') &&
    !order.waybill_number &&
    !order.tracking_number

  const deliveryMethodLabel: Record<string, string> = {
    standard: 'Standard',
    express: 'Express',
    pudo: 'Pudo Pickup',
    collect: 'Collect In-Store',
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
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="container-wide py-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Link href="/admin/inventory" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <ArrowLeft className="w-6 h-6 text-text-light" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold font-playfair text-text">Orders</h1>
                <p className="text-xs text-text-muted uppercase tracking-widest font-bold">Store Admin</p>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-gray-50 border-t border-gray-100 mt-4 -mx-4 px-4 py-3">
            <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
              <Filter className="w-4 h-4 text-text-muted flex-shrink-0" />
              {['all', 'pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled'].map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
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
        </div>
      </div>

      {/* Main Content */}
      <div className="container-wide py-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 opacity-50">
            <Loader2 className="w-12 h-12 animate-spin text-vintage-primary mb-4" />
            <p className="font-bold text-text uppercase tracking-widest text-xs">Loading orders...</p>
          </div>
        ) : filteredOrders.length > 0 ? (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <div
                key={order.id}
                className="card p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <p className="font-bold text-vintage-primary">#{order.order_number}</p>
                    <p className="text-sm text-text-muted">
                      {order.customer_first_name} {order.customer_last_name} • {order.customer_email}
                    </p>
                    <p className="text-xs text-text-muted">
                      {new Date(order.created_at).toLocaleDateString()} •{' '}
                      {deliveryMethodLabel[order.delivery_method] || order.delivery_method}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-xs text-text-muted">Total</p>
                      <p className="font-bold text-text">R{Number(order.total).toFixed(2)}</p>
                    </div>
                    <div
                      className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
                        order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                        order.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                        order.status === 'shipped' ? 'bg-blue-100 text-blue-700' :
                        order.status === 'paid' ? 'bg-vintage-primary/10 text-vintage-primary' :
                        'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {order.status}
                    </div>
                    {order.waybill_number && (
                      <p className="text-xs text-text-muted">Waybill: {order.waybill_number}</p>
                    )}
                    {canCreateShipment(order) && (
                      <button
                        onClick={() => handleCreateShipment(order.id)}
                        disabled={!!creatingShipment}
                        className="btn btn-primary btn-sm flex items-center gap-2"
                      >
                        {creatingShipment === order.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Truck className="w-4 h-4" />
                        )}
                        Create Shipment
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <Package className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-xl font-semibold text-text mb-2">No orders found</h3>
            <p className="text-text-muted mb-6">
              {statusFilter === 'all' ? 'No orders yet.' : `No orders with status "${statusFilter}".`}
            </p>
            <Link href="/admin/inventory" className="btn btn-primary">
              Back to Inventory
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
