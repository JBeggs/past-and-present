import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import {
  buildWhatsAppShareUrl,
  isMobileDevice,
  resolveShareImageFetchUrl,
  shareTextWithOptionalImage,
} from '@/lib/share-with-image'

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

describe('shareTextWithOptionalImage', () => {
  const originalNavigator = globalThis.navigator
  const originalFetch = globalThis.fetch

  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({
        ok: true,
        blob: async () => new Blob(['fake'], { type: 'image/jpeg' }),
        headers: { get: () => 'image/jpeg' },
      })),
    )
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    Object.defineProperty(globalThis, 'navigator', {
      value: originalNavigator,
      configurable: true,
    })
    globalThis.fetch = originalFetch
  })

  it('shares text with image, not image-only', async () => {
    const share = vi.fn(async (data: ShareData) => {
      expect(data.text).toBe('Hello from Past and Present')
      expect(data.files?.length).toBe(1)
    })
    const canShare = vi.fn((data: ShareData) => Boolean(data.files?.length || data.text))

    Object.defineProperty(globalThis, 'navigator', {
      value: { share, canShare },
      configurable: true,
    })

    const ok = await shareTextWithOptionalImage(
      'Hello from Past and Present',
      '/api/og-products?title=Test',
      'products.jpg',
    )

    expect(ok).toBe(true)
    expect(share).toHaveBeenCalledTimes(1)
    expect(share.mock.calls[0][0].text).toBe('Hello from Past and Present')
  })

  it('falls back to text-only share when text+files is rejected', async () => {
    const share = vi.fn(async (data: ShareData) => {
      if (data.files?.length && data.text) {
        throw new DOMException('Not allowed', 'NotAllowedError')
      }
    })
    const canShare = vi.fn((data: ShareData) => {
      if (data.files?.length && data.text) return false
      return Boolean(data.text)
    })

    Object.defineProperty(globalThis, 'navigator', {
      value: { share, canShare },
      configurable: true,
    })

    const ok = await shareTextWithOptionalImage('Caption only', '/api/og-products?title=Test')

    expect(ok).toBe(true)
    expect(canShare).toHaveBeenCalledWith({ text: 'Caption only' })
  })
})
