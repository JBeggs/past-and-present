// TypeScript types for Past and Present e-commerce platform

export type UserRole = 'user' | 'admin' | 'editor' | 'author' | 'business_owner' | 'subscriber'
export type ArticleStatus = 'draft' | 'scheduled' | 'published' | 'archived' | 'featured'
export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded'
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded'
export type ProductCondition = 'new' | 'like_new' | 'good' | 'fair' | 'vintage'

// Profile interface
export interface Profile {
  id: string
  email: string
  username?: string
  full_name?: string
  bio?: string
  avatar_url?: string
  role: UserRole
  is_verified: boolean
  social_links: Record<string, string>
  preferences: Record<string, any>
  last_seen_at?: string
  created_at: string
  updated_at: string
}

// Category for products and articles
export interface Category {
  id: string
  name: string
  slug: string
  description?: string
  color: string
  icon?: string
  parent_id?: string
  is_featured: boolean
  sort_order: number
  created_at: string
  updated_at: string
  parent?: Category
  subcategories?: Category[]
}

// Tag system
export interface Tag {
  id: string
  name: string
  slug: string
  description?: string
  color: string
  usage_count: number
  created_at: string
}

// Media/Gallery system
export interface Media {
  id: string
  filename: string
  original_filename: string
  file_url: string
  thumbnail_url?: string
  media_type: 'image' | 'video' | 'audio' | 'document'
  mime_type: string
  file_size?: number
  width?: number
  height?: number
  alt_text?: string
  caption?: string
  credits?: string
  is_public: boolean
  created_at: string
  updated_at: string
}

// Article for content pages (home, about, recipes, etc.)
export interface Article {
  id: string
  title: string
  slug: string
  subtitle?: string
  excerpt?: string
  content: string
  featured_media_id?: string
  author_id: string
  category_id?: string
  status: ArticleStatus
  is_premium: boolean
  views: number
  likes: number
  read_time_minutes?: number
  published_at?: string
  created_at: string
  updated_at: string
  author?: Profile
  category?: Category
  tags?: Tag[]
  featured_media?: Media
}

// Product for e-commerce
export interface Product {
  id: string
  name: string
  slug: string
  description?: string
  short_description?: string
  long_description?: string
  price: number
  compare_at_price?: number
  cost_price?: number
  sku?: string
  barcode?: string
  quantity: number
  track_inventory: boolean
  allow_backorder: boolean
  weight?: number
  weight_unit?: string
  dimension_length?: number
  dimension_width?: number
  dimension_height?: number
  is_active: boolean
  featured: boolean
  status: 'active' | 'draft' | 'archived'
  color?: string
  category_id?: string
  featured_image_id?: string
  seo_title?: string
  seo_description?: string
  seo_keywords?: string
  canonical_url?: string
  created_at: string
  updated_at: string
  published_at?: string
  category?: Category
  featured_image?: Media
   images?: ProductImage[]
   tags?: string[] | Tag[]
   stock_quantity: number | null
   in_stock: boolean
   image?: string // Flattened image URL for public API
 }

export interface ProductImage {
  id: string
  product_id: string
  media_id: string
  sort_order: number
  created_at: string
  media?: Media
}

// Shopping Cart
export interface CartItem {
  id: string
  product_id: string
  product_name?: string
  product_image?: string
  product_sku?: string
  quantity: number
  price: number
  subtotal: number
  created_at: string
  product?: Product
}

export interface Cart {
  id: string
  user_id?: string
  session_id?: string
  items: CartItem[]
  subtotal: number
  tax: number
  shipping: number
  total: number
  created_at: string
  updated_at: string
}

// Order
export interface OrderItem {
  id: string
  order_id: string
  product_id: string
  product_name: string
  product_sku?: string
  quantity: number
  unit_price: number
  total_price: number
  created_at: string
  product?: Product
}

export interface Order {
  id: string
  order_number: string
  user_id?: string
  status: OrderStatus
  payment_status: PaymentStatus
  
  // Customer info
  customer_email: string
  customer_name: string
  customer_phone?: string
  
  // Shipping address
  shipping_address_line1: string
  shipping_address_line2?: string
  shipping_city: string
  shipping_state?: string
  shipping_postal_code: string
  shipping_country: string
  
  // Billing address (if different)
  billing_same_as_shipping: boolean
  billing_address_line1?: string
  billing_address_line2?: string
  billing_city?: string
  billing_state?: string
  billing_postal_code?: string
  billing_country?: string
  
  // Totals
  subtotal: number
  tax: number
  shipping_cost: number
  discount: number
  total: number
  
  // Payment
  payment_method?: string
  payment_reference?: string
  paid_at?: string
  
  // Shipping
  shipping_method?: string
  tracking_number?: string
  shipped_at?: string
  delivered_at?: string
  
  // Notes
  customer_notes?: string
  internal_notes?: string
  
  created_at: string
  updated_at: string
  
  items?: OrderItem[]
  user?: Profile
}

// Site settings
export interface SiteSetting {
  key: string
  value: any
  type: 'string' | 'number' | 'boolean' | 'json'
  description?: string
  updated_at: string
}

// API Response types
export interface PaginatedResponse<T> {
  results: T[]
  count: number
  next?: string
  previous?: string
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// Cart management types
export interface AddToCartRequest {
  product_id: string
  quantity: number
}

export interface UpdateCartItemRequest {
  quantity: number
}

// Checkout types
export interface CheckoutRequest {
  customer_email: string
  customer_name: string
  customer_phone?: string
  shipping_address_line1: string
  shipping_address_line2?: string
  shipping_city: string
  shipping_state?: string
  shipping_postal_code: string
  shipping_country: string
  billing_same_as_shipping: boolean
  billing_address_line1?: string
  billing_address_line2?: string
  billing_city?: string
  billing_state?: string
  billing_postal_code?: string
  billing_country?: string
  customer_notes?: string
  shipping_method?: string
}

// Yoco payment types
export interface YocoCheckoutResponse {
  id: string
  redirectUrl: string
  status: string
}

export interface YocoPaymentVerification {
  status: 'successful' | 'failed' | 'pending'
  order_id?: string
  payment_reference?: string
  error?: string
}
