import { describe, expect, it } from 'vitest'
import { buildWhatsAppShareUrl, isMobileDevice, resolveShareImageFetchUrl } from '@/lib/share-with-image'

describe('isMobileDevice', () => {
  it('detects iPhone user agents', () => {
    expect(isMobileDevice('Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)')).toBe(true)
  })

  it('detects Android user agents', () => {
    expect(isMobileDevice('Mozilla/5.0 (Linux; Android 14; Pixel 7)')).toBe(true)
  })

  it('returns false for desktop user agents', () => {
    expect(isMobileDevice('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)')).toBe(false)
  })
})

describe('buildWhatsAppShareUrl', () => {
  it('uses whatsapp:// on mobile', () => {
    const url = buildWhatsAppShareUrl('Hello world', 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)')
    expect(url).toBe('whatsapp://send?text=Hello%20world')
  })

  it('uses wa.me on desktop', () => {
    const url = buildWhatsAppShareUrl('Hello world', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)')
    expect(url).toBe('https://wa.me/?text=Hello%20world')
  })
})

describe('resolveShareImageFetchUrl', () => {
  it('rewrites absolute media URLs to the current origin path', () => {
    const resolved = resolveShareImageFetchUrl(
      'https://past-and-present.co.za/api/og-products?title=Hardware&category=hardware',
    )
    expect(resolved).toMatch(/\/api\/og-products\?title=Hardware&category=hardware$/)
    expect(resolved).not.toContain('past-and-present.co.za')
  })

  it('prefixes relative paths with window origin when available', () => {
    const resolved = resolveShareImageFetchUrl('/api/media?src=%2Fmedia%2Fa.jpg')
    if (typeof window !== 'undefined') {
      expect(resolved).toBe(`${window.location.origin}/api/media?src=%2Fmedia%2Fa.jpg`)
    } else {
      expect(resolved).toBe('/api/media?src=%2Fmedia%2Fa.jpg')
    }
  })
})
