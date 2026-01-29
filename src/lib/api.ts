/**
 * API Client for Django REST API
 * Adapted from Riverside Herald for Past and Present
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://3pillars.pythonanywhere.com/api'
const DEFAULT_COMPANY_SLUG = process.env.NEXT_PUBLIC_COMPANY_SLUG || 'past-and-present'

export interface ApiError {
  message: string
  code?: string
  details?: any
  url?: string
  status?: number
}

export class ApiClient {
  private baseURL: string
  private token: string | null = null
  private companyId: string | null = null
  private refreshToken: string | null = null
  private isRefreshing: boolean = false
  private refreshPromise: Promise<string | null> | null = null

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL
    if (typeof window !== 'undefined') {
      this.refreshToken = localStorage.getItem('refresh_token')
    }
  }

  setToken(token: string | null) {
    this.token = token
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('auth_token', token)
        document.cookie = `auth_token=${token}; path=/; max-age=86400; SameSite=Lax`
      } else {
        localStorage.removeItem('auth_token')
        document.cookie = 'auth_token=; path=/; max-age=0'
      }
    }
  }

  setRefreshToken(refreshToken: string | null) {
    this.refreshToken = refreshToken
    if (typeof window !== 'undefined') {
      if (refreshToken) {
        localStorage.setItem('refresh_token', refreshToken)
        document.cookie = `refresh_token=${refreshToken}; path=/; max-age=604800; SameSite=Lax`
      } else {
        localStorage.removeItem('refresh_token')
        document.cookie = 'refresh_token=; path=/; max-age=0'
      }
    }
  }

  getRefreshToken(): string | null {
    if (this.refreshToken) return this.refreshToken
    if (typeof window !== 'undefined') {
      return localStorage.getItem('refresh_token')
    }
    return null
  }

  private async attemptTokenRefresh(): Promise<string | null> {
    if (this.isRefreshing && this.refreshPromise) {
      return this.refreshPromise
    }

    const refreshToken = this.getRefreshToken()
    if (!refreshToken) {
      return null
    }

    this.isRefreshing = true
    this.refreshPromise = (async () => {
      try {
        const response = await fetch(`${this.baseURL}/auth/refresh/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refresh: refreshToken }),
        })

        if (response.ok) {
          const data = await response.json()
          if (data.access) {
            this.setToken(data.access)
            return data.access
          }
        } else {
          this.setToken(null)
          this.setRefreshToken(null)
          if (typeof window !== 'undefined') {
            window.location.href = '/login'
          }
          return null
        }
      } catch (error) {
        console.error('Token refresh failed:', error)
        this.setToken(null)
        this.setRefreshToken(null)
        return null
      } finally {
        this.isRefreshing = false
        this.refreshPromise = null
      }
      return null
    })()

    return this.refreshPromise
  }

  getToken(): string | null {
    if (this.token) return this.token
    if (typeof window !== 'undefined') {
      return localStorage.getItem('auth_token')
    }
    return null
  }

  setCompanyId(companyId: string | null) {
    this.companyId = companyId
    if (typeof window !== 'undefined') {
      if (companyId) {
        localStorage.setItem('company_id', companyId)
        document.cookie = `company_id=${companyId}; path=/; max-age=86400; SameSite=Lax`
      } else {
        localStorage.removeItem('company_id')
        document.cookie = 'company_id=; path=/; max-age=0'
      }
    }
  }

  getCompanyId(): string | null {
    if (this.companyId) return this.companyId
    if (typeof window !== 'undefined') {
      return localStorage.getItem('company_id')
    }
    return null
  }

  private getHeaders(includeAuth: boolean = true): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    }

    if (includeAuth) {
      const token = this.getToken()
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }
    }

    const companyId = this.getCompanyId()
    if (companyId) {
      headers['X-Company-Id'] = companyId
    }
    
    headers['X-Company-Slug'] = DEFAULT_COMPANY_SLUG

    return headers
  }

  private async handleResponse<T>(response: Response, retryRequest?: () => Promise<Response>): Promise<T> {
    if (!response.ok) {
      if (response.status === 401 && this.getRefreshToken() && retryRequest) {
        const newToken = await this.attemptTokenRefresh()
        if (newToken) {
          const retryResponse = await retryRequest()
          return this.handleResponse<T>(retryResponse)
        }
      }

      let error: ApiError
      const contentType = response.headers.get('content-type') || ''
      const hasJsonContent = contentType.includes('application/json')
      const text = await response.text()
      
      try {
        let data: any = {}
        
        if (hasJsonContent && text.trim()) {
          try {
            data = JSON.parse(text)
          } catch {
            data = { message: text || `HTTP ${response.status}: ${response.statusText}` }
          }
        } else if (text.trim()) {
          data = { message: text }
        } else {
          data = { message: `HTTP ${response.status}: ${response.statusText}` }
        }
        
        let message = 'An error occurred'
        
        const hasFieldErrors = Object.keys(data).some(key => 
          key !== 'error' && key !== 'detail' && key !== 'message' && 
          (Array.isArray(data[key]) || typeof data[key] === 'string')
        )
        
        if (hasFieldErrors) {
          const errorFields = Object.entries(data)
            .filter(([key]) => key !== 'error' && key !== 'detail' && key !== 'message')
            .map(([field, messages]: [string, any]) => {
              const messageArray = Array.isArray(messages) ? messages : [messages]
              const formattedField = field.split('_').map(word => 
                word.charAt(0).toUpperCase() + word.slice(1)
              ).join(' ')
              return `${formattedField}: ${messageArray.join(', ')}`
            })
          message = errorFields.join('; ')
        } else if (data.error) {
          if (typeof data.error === 'object' && data.error !== null) {
            const errorFields = Object.entries(data.error).map(([field, messages]: [string, any]) => {
              const messageArray = Array.isArray(messages) ? messages : [messages]
              return `${field}: ${messageArray.join(', ')}`
            })
            message = errorFields.join('; ')
          } else if (typeof data.error === 'string') {
            message = data.error
          }
        } else {
          message = data.message || data.detail || `HTTP ${response.status}: ${response.statusText}`
        }
        
        error = {
          message,
          code: data.code || `HTTP_${response.status}`,
          details: Object.keys(data).length > 0 ? data : undefined,
          url: response.url,
          status: response.status,
        }
      } catch {
        error = {
          message: `HTTP ${response.status}: ${response.statusText}`,
          code: `HTTP_${response.status}`,
          url: response.url,
          status: response.status,
        }
      }
      throw error
    }

    const contentType = response.headers.get('content-type')
    if (contentType && contentType.includes('application/json')) {
      return await response.json()
    }
    return await response.text() as unknown as T
  }

  async get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    const url = new URL(`${this.baseURL}${endpoint}`)
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value))
        }
      })
    }

    const makeRequest = () => fetch(url.toString(), {
      method: 'GET',
      headers: this.getHeaders(),
    })

    const response = await makeRequest()
    return this.handleResponse<T>(response, makeRequest)
  }

  async post<T>(endpoint: string, data?: any, includeAuth: boolean = true): Promise<T> {
    const makeRequest = () => fetch(`${this.baseURL}${endpoint}`, {
      method: 'POST',
      headers: this.getHeaders(includeAuth),
      body: data ? JSON.stringify(data) : undefined,
    })

    const response = await makeRequest()
    return this.handleResponse<T>(response, makeRequest)
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    const makeRequest = () => fetch(`${this.baseURL}${endpoint}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: data ? JSON.stringify(data) : undefined,
    })

    const response = await makeRequest()
    return this.handleResponse<T>(response, makeRequest)
  }

  async patch<T>(endpoint: string, data?: any): Promise<T> {
    const makeRequest = () => fetch(`${this.baseURL}${endpoint}`, {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: data ? JSON.stringify(data) : undefined,
    })

    const response = await makeRequest()
    return this.handleResponse<T>(response, makeRequest)
  }

  async delete<T>(endpoint: string, data?: Record<string, any>): Promise<T> {
    const makeRequest = () => {
      const options: RequestInit = {
        method: 'DELETE',
        headers: this.getHeaders(),
      }
      
      if (data) {
        options.headers = {
          ...options.headers,
          'Content-Type': 'application/json',
        }
        options.body = JSON.stringify(data)
      }

      return fetch(`${this.baseURL}${endpoint}`, options)
    }

    const response = await makeRequest()
    return this.handleResponse<T>(response, makeRequest)
  }

  async uploadFile<T>(endpoint: string, file: File, additionalData?: Record<string, any>): Promise<T> {
    const makeRequest = () => {
      const formData = new FormData()
      formData.append('file', file)
      
      if (additionalData) {
        Object.entries(additionalData).forEach(([key, value]) => {
          formData.append(key, String(value))
        })
      }

      const headers: HeadersInit = {}
      const token = this.getToken()
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }
      const companyId = this.getCompanyId()
      if (companyId) {
        headers['X-Company-Id'] = companyId
      }
      headers['X-Company-Slug'] = DEFAULT_COMPANY_SLUG

      return fetch(`${this.baseURL}${endpoint}`, {
        method: 'POST',
        headers,
        body: formData,
      })
    }

    const response = await makeRequest()
    return this.handleResponse<T>(response, makeRequest)
  }
}

// Create singleton instance
export const apiClient = new ApiClient()

// Auth API methods
export const authApi = {
  async login(username: string, password: string) {
    const response = await apiClient.post<{
      access: string
      refresh: string
      user: any
      company?: { id: string; name: string }
    }>('/auth/login/', { username, password }, false)

    if (response.access) {
      apiClient.setToken(response.access)
      if (response.refresh) {
        apiClient.setRefreshToken(response.refresh)
      }
      if (response.company?.id) {
        apiClient.setCompanyId(response.company.id)
      }
    }

    return response
  },

  async register(data: {
    email: string
    password: string
    company_name?: string
    company_email?: string
    full_name?: string
    password_confirm?: string
    role?: string
  }) {
    const requestData: any = {
      email: data.email,
      password: data.password,
      password_confirm: data.password_confirm || data.password,
    }
    
    if (data.company_name) {
      const emailPrefix = data.email.split('@')[0]
      const timestamp = Date.now().toString().slice(-6)
      requestData.username = `${emailPrefix}${timestamp}`
      requestData.company_name = data.company_name
      requestData.company_email = data.company_email || data.email
      
      if (data.full_name) {
        const nameParts = data.full_name.trim().split(/\s+/)
        requestData.first_name = nameParts[0] || ''
        requestData.last_name = nameParts.slice(1).join(' ') || ''
      }
    } else {
      if (data.full_name) {
        requestData.full_name = data.full_name
      }
      if (data.role) {
        requestData.role = data.role
      }
    }
    
    const response = await apiClient.post<{
      user: any
      company: { id: string; name: string }
      tokens?: { access: string; refresh: string }
      profile?: { role: string; is_verified: boolean }
    }>('/auth/register/', requestData, false)

    if (response.tokens?.access) {
      apiClient.setToken(response.tokens.access)
      if (response.company?.id) {
        apiClient.setCompanyId(response.company.id)
      }
    }

    return response
  },

  async refreshToken(refreshToken: string) {
    const response = await apiClient.post<{ access: string }>(
      '/auth/refresh/',
      { refresh: refreshToken },
      false
    )
    
    if (response.access) {
      apiClient.setToken(response.access)
    }

    return response
  },

  logout() {
    apiClient.setToken(null)
    apiClient.setCompanyId(null)
  },
}

// News/Articles API methods
export const newsApi = {
  articles: {
    list: (params?: { status?: string; category?: string; search?: string; page?: number }) =>
      apiClient.get('/news/articles/', params),
    get: (id: string) => apiClient.get(`/news/articles/${id}/`),
    getBySlug: (slug: string) => apiClient.get(`/news/articles/?slug=${slug}`),
    create: (data: any) => apiClient.post('/news/articles/', data),
    update: (id: string, data: any) => apiClient.put(`/news/articles/${id}/`, data),
    patch: (id: string, data: any) => apiClient.patch(`/news/articles/${id}/`, data),
    delete: (id: string) => apiClient.delete(`/news/articles/${id}/`),
    incrementViews: (id: string) => apiClient.post(`/news/articles/${id}/increment_views/`),
  },

  categories: {
    list: () => apiClient.get('/news/categories/'),
    get: (id: string) => apiClient.get(`/news/categories/${id}/`),
  },

  tags: {
    list: () => apiClient.get('/news/tags/'),
    get: (id: string) => apiClient.get(`/news/tags/${id}/`),
  },

  media: {
    list: (params?: { media_type?: string; is_public?: boolean }) =>
      apiClient.get('/news/media/', params),
    get: (id: string) => apiClient.get(`/news/media/${id}/`),
    upload: (file: File, data?: any) => apiClient.uploadFile('/news/media/', file, data),
  },

  siteSettings: {
    list: () => apiClient.get('/news/site-settings/'),
    get: (key: string) => apiClient.get(`/news/site-settings/?key=${key}`),
  },

  profile: {
    get: () => apiClient.get('/news/profiles/me/'),
    update: (data: any) => apiClient.put('/news/profiles/me/', data),
    patch: (data: any) => apiClient.patch('/news/profiles/me/', data),
  },
}

// Ecommerce API methods
export const ecommerceApi = {
  products: {
    list: (params?: { category?: string; search?: string; page?: number; is_active?: boolean }) =>
      apiClient.get('/ecommerce/products/', params),
    get: (id: string) => apiClient.get(`/ecommerce/products/${id}/`),
    getBySlug: (slug: string) => apiClient.get(`/ecommerce/products/?slug=${slug}`),
    create: (data: any) => apiClient.post('/ecommerce/products/', data),
    update: (id: string, data: any) => apiClient.put(`/ecommerce/products/${id}/`, data),
    delete: (id: string) => apiClient.delete(`/ecommerce/products/${id}/`),
  },

  categories: {
    list: () => apiClient.get('/ecommerce/categories/'),
    get: (id: string) => apiClient.get(`/ecommerce/categories/${id}/`),
  },

  orders: {
    list: (params?: { status?: string; page?: number }) =>
      apiClient.get('/ecommerce/orders/', params),
    get: (id: string) => apiClient.get(`/ecommerce/orders/${id}/`),
    create: (data: any) => apiClient.post('/ecommerce/orders/', data),
    update: (id: string, data: any) => apiClient.patch(`/ecommerce/orders/${id}/`, data),
  },

  cart: {
    get: () => apiClient.get('/ecommerce/cart/'),
    addItem: (productId: string, quantity: number) =>
      apiClient.post('/ecommerce/cart/add/', { product_id: productId, quantity }),
    updateItem: (itemId: string, quantity: number) =>
      apiClient.patch(`/ecommerce/cart/items/${itemId}/`, { quantity }),
    removeItem: (itemId: string) =>
      apiClient.delete(`/ecommerce/cart/items/${itemId}/`),
    clear: () => apiClient.delete('/ecommerce/cart/clear/'),
  },

  checkout: {
    initiate: (data: any) => apiClient.post('/ecommerce/checkout/', data),
    complete: (orderId: string, paymentData: any) =>
      apiClient.post(`/ecommerce/checkout/${orderId}/complete/`, paymentData),
  },

  // Yoco payment integration
  payments: {
    createCheckout: (orderId: string) =>
      apiClient.post(`/ecommerce/payments/yoco/checkout/`, { order_id: orderId }),
    verifyPayment: (checkoutId: string) =>
      apiClient.get(`/ecommerce/payments/yoco/verify/${checkoutId}/`),
  },
}

export default apiClient
