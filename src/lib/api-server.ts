/**
 * Server-side API client for Next.js Server Components
 * Uses cookies for authentication instead of localStorage
 */

import { cookies } from 'next/headers'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://3pillars.pythonanywhere.com/api'
const DEFAULT_COMPANY_SLUG = process.env.NEXT_PUBLIC_COMPANY_SLUG || 'past-and-present'

class ServerApiClient {
  private baseURL: string

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL
  }

  private async getHeaders(): Promise<HeadersInit> {
    const cookieStore = await cookies()
    const token = cookieStore.get('auth_token')?.value
    const companyId = cookieStore.get('company_id')?.value

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    }

    if (DEFAULT_COMPANY_SLUG) {
      headers['X-Company-Slug'] = DEFAULT_COMPANY_SLUG
    }

    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    if (companyId) {
      headers['X-Company-Id'] = companyId
    }

    return headers
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

    const headers = await this.getHeaders()
    console.log(`DEBUG: Fetching ${url.toString()} with headers:`, JSON.stringify(headers))

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers,
      cache: 'no-store', // Disable caching for authenticated requests
    })

    if (!response.ok) {
      if (response.status === 401) {
        // Only return empty/null if it's not a public-friendly endpoint
        // For now, let's log it but allow the error to propagate if it's not a 401 we want to swallow
        console.warn(`API 401 at ${url.toString()}`)
        
        // If it's a GET request to a potentially public endpoint, we might want to throw 
        // instead of returning empty, so the UI can handle it or we can see the real error.
        // However, the current behavior is to return empty. Let's make it more selective.
        
        const isPublicEndpoint = endpoint.includes('/v1/products/') || 
                                endpoint.includes('/v1/categories/') ||
                                endpoint.includes('/news/')

        if (isPublicEndpoint) {
          // If a public endpoint returns 401, it's likely a backend configuration issue 
          // or it actually requires a token when it shouldn't.
          console.error(`Public endpoint ${endpoint} returned 401 Unauthorized. Please check backend permissions.`);
          if (endpoint.endsWith('/') || endpoint.includes('?')) {
            return [] as unknown as T
          }
          return null as unknown as T
        }

        if (endpoint.endsWith('/') || endpoint.includes('?')) {
          return [] as unknown as T
        }
        return null as unknown as T
      }
      if (response.status === 404) {
        console.warn(`API 404 at ${url.toString()}`)
        // Return empty array for list endpoints, or null for single object endpoints
        if (endpoint.endsWith('/') || endpoint.includes('?')) {
          return [] as unknown as T
        }
        return null as unknown as T
      }
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    return response.json()
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'POST',
      headers: await this.getHeaders(),
      body: data ? JSON.stringify(data) : undefined,
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    return response.json()
  }
}

const serverApiClient = new ServerApiClient()

// Server-side News API
export const serverNewsApi = {
  articles: {
    list: (params?: { status?: string; category?: string; search?: string; page?: number }) =>
      serverApiClient.get('/news/articles/', params),
    get: (id: string) => serverApiClient.get(`/news/articles/${id}/`),
    getBySlug: (slug: string) => serverApiClient.get(`/news/articles/?slug=${slug}`),
  },

  categories: {
    list: () => serverApiClient.get('/news/categories/'),
    get: (id: string) => serverApiClient.get(`/news/categories/${id}/`),
  },

  siteSettings: {
    list: () => serverApiClient.get('/news/site-settings/'),
  },
}

// Server-side Ecommerce API
export const serverEcommerceApi = {
  products: {
    list: (params?: { category?: string; search?: string; page?: number; is_active?: boolean }) =>
      serverApiClient.get(`/v1/public/${DEFAULT_COMPANY_SLUG}/products/`, params),
    get: (id: string) => serverApiClient.get(`/v1/products/${id}/`),
    getBySlug: (slug: string) => serverApiClient.get(`/v1/public/${DEFAULT_COMPANY_SLUG}/products/slug/${slug}/`),
  },

  categories: {
    list: () => serverApiClient.get(`/v1/public/${DEFAULT_COMPANY_SLUG}/categories/`),
    get: (id: string) => serverApiClient.get(`/v1/categories/${id}/`),
  },
}

export default serverApiClient
