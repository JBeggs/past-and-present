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
      'X-Company-Slug': DEFAULT_COMPANY_SLUG,
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

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: await this.getHeaders(),
      next: { revalidate: 60 }, // Cache for 60 seconds
    })

    if (!response.ok) {
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
      serverApiClient.get('/ecommerce/products/', params),
    get: (id: string) => serverApiClient.get(`/ecommerce/products/${id}/`),
    getBySlug: (slug: string) => serverApiClient.get(`/ecommerce/products/?slug=${slug}`),
  },

  categories: {
    list: () => serverApiClient.get('/ecommerce/categories/'),
    get: (id: string) => serverApiClient.get(`/ecommerce/categories/${id}/`),
  },
}

export default serverApiClient
