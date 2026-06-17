import { describe, expect, it } from 'vitest'
import { buildWhatsAppShareUrl, isMobileDevice } from '@/lib/share-with-image'

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
