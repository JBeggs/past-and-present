/**
 * Same-origin proxy for Django /media/* assets (Vercel edge cache + Lighthouse).
 * Do not use next/image — PythonAnywhere origins 504 through the optimizer.
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://3pillars.pythonanywhere.com/api'

export function getBackendMediaHostname(): string {
  try {
    return new URL(API_BASE_URL).hostname
  } catch {
    return '3pillars.pythonanywhere.com'
  }
}

export function getBackendOrigin(): string {
  try {
    const url = new URL(API_BASE_URL)
    return `${url.protocol}//${url.host}`
  } catch {
    return 'https://3pillars.pythonanywhere.com'
  }
}

/** Public storefront origin (https, no trailing slash). */
export function getPublicSiteOrigin(): string | null {
  let raw = (process.env.NEXT_PUBLIC_SITE_URL || '').trim().replace(/\/$/, '')
  if (!raw && process.env.VERCEL_URL) {
    raw = process.env.VERCEL_URL.replace(/^https?:\/\//, '').replace(/\/$/, '')
  }
  if (!raw) return null
  if (!/^https?:\/\//i.test(raw)) raw = `https://${raw}`
  return raw.replace(/\/$/, '')
}

/** Prefer the live request host (custom domain) over build-time VERCEL_URL for OG/share URLs. */
export async function getRequestSiteOrigin(): Promise<string | null> {
  try {
    const { headers } = await import('next/headers')
    const h = await headers()
    const host = (h.get('x-forwarded-host') || h.get('host') || '')
      .split(',')[0]
      ?.trim()
    if (host && !host.startsWith('localhost') && !host.startsWith('127.0.0.1')) {
      return `https://${host}`
    }
  } catch {
    /* static / edge contexts without request headers */
  }
  return getPublicSiteOrigin()
}

/** Validate upstream media URL for proxy routes (open-redirect safe). */
export function parseAllowedMediaSrc(src: string | null): URL | null {
  if (!src || src.length > 2048) return null
  let upstreamUrl: URL
  try {
    upstreamUrl = new URL(src)
  } catch {
    return null
  }
  if (upstreamUrl.hostname !== getBackendMediaHostname()) return null
  if (!upstreamUrl.pathname.startsWith('/media/')) return null
  return upstreamUrl
}

export function isProxiableMediaUrl(url: string): boolean {
  if (!url || url.startsWith('data:')) return false
  if (url.startsWith('/images/')) return false
  try {
    const absolute = url.startsWith('http') ? url : `${getBackendOrigin()}${url.startsWith('/') ? url : `/${url}`}`
    const parsed = new URL(absolute)
    return parsed.hostname === getBackendMediaHostname() && parsed.pathname.startsWith('/media/')
  } catch {
    return false
  }
}

/** Browser-facing URL: same-origin /api/media when src is backend media. */
export function proxyMediaUrl(absoluteUrl: string): string {
  if (!absoluteUrl || !isProxiableMediaUrl(absoluteUrl)) return absoluteUrl
  let mediaUrl = absoluteUrl
  if (!mediaUrl.startsWith('http')) {
    mediaUrl = `${getBackendOrigin()}${mediaUrl.startsWith('/') ? mediaUrl : `/${mediaUrl}`}`
  }
  try {
    const site = getPublicSiteOrigin()
    if (site) {
      const storefront = new URL(site)
      const imageUrl = new URL(mediaUrl)
      if (imageUrl.hostname === storefront.hostname) return absoluteUrl
    }
  } catch {
    return absoluteUrl
  }
  // Relative URL so images work on production alias, preview, and custom domains
  // (absolute URLs baked at build time point at VERCEL_URL and break with SSO previews).
  return `/api/media?src=${encodeURIComponent(mediaUrl)}`
}

/** Absolute proxied URL for Open Graph / metadata (needs canonical site origin). */
export function absoluteProxyMediaUrl(absoluteUrl: string): string {
  const relative = proxyMediaUrl(absoluteUrl)
  if (!relative.startsWith('/api/media')) return relative
  const site = getPublicSiteOrigin()
  if (!site) return absoluteUrl
  return `${site.replace(/\/$/, '')}${relative}`
}

export const MEDIA_PROXY_CACHE_PAGE =
  'public, max-age=604800, s-maxage=604800, stale-while-revalidate=86400'

export const OG_PROXY_CACHE_PAGE = 'public, max-age=86400, s-maxage=86400'

export function mediaProxyUserAgent(): string {
  const slug = (process.env.NEXT_PUBLIC_COMPANY_SLUG || 'storefront').replace(/[^a-zA-Z0-9._-]+/g, '-')
  return (
    process.env.OG_PROXY_USER_AGENT?.trim() ||
    process.env.MEDIA_PROXY_USER_AGENT?.trim() ||
    `${slug}-MediaProxy/1.0`
  )
}

/** Django often serves .webp as application/octet-stream — normalize for OG + Web Share. */
export function inferImageContentType(pathOrUrl: string, upstreamType?: string | null): string {
  const ct = (upstreamType || '').split(';')[0].trim().toLowerCase()
  if (ct.startsWith('image/')) return ct

  let path = (pathOrUrl || '').split('?')[0].toLowerCase()
  try {
    path = new URL(pathOrUrl).pathname.toLowerCase()
  } catch {
    /* use raw path fragment */
  }

  if (path.endsWith('.webp')) return 'image/webp'
  if (path.endsWith('.png')) return 'image/png'
  if (path.endsWith('.gif')) return 'image/gif'
  if (path.endsWith('.svg')) return 'image/svg+xml'
  if (path.endsWith('.jpg') || path.endsWith('.jpeg')) return 'image/jpeg'
  return ct || 'image/jpeg'
}

/** Sniff image MIME from magic bytes when path/extension is ambiguous. */
export function sniffImageContentType(bytes: Uint8Array, fallback = 'image/jpeg'): string {
  if (bytes.length >= 12
    && bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46
    && bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50) {
    return 'image/webp'
  }
  if (bytes.length >= 8
    && bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) {
    return 'image/png'
  }
  if (bytes.length >= 2 && bytes[0] === 0xff && bytes[1] === 0xd8) {
    return 'image/jpeg'
  }
  return fallback
}
