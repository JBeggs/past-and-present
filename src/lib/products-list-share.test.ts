import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import * as shareWithImage from '@/lib/share-with-image'
import { shareProductsListOnWhatsApp } from '@/lib/products-list-share'

describe('shareProductsListOnWhatsApp', () => {
  const originalNavigator = globalThis.navigator
  const originalFetch = globalThis.fetch

  beforeEach(() => {
    vi.spyOn(shareWithImage, 'openWhatsAppWithText').mockImplementation(() => {})
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
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
    Object.defineProperty(globalThis, 'navigator', {
      value: originalNavigator,
      configurable: true,
    })
    globalThis.fetch = originalFetch
  })

  it('prefers text plus files when the share sheet accepts both', async () => {
    const share = vi.fn(async (data: ShareData) => {
      expect(data.text).toBe('Shelf caption')
      expect(data.files?.length).toBe(1)
    })
    const canShare = vi.fn(() => true)

    Object.defineProperty(globalThis, 'navigator', {
      value: { share, canShare },
      configurable: true,
    })

    const result = await shareProductsListOnWhatsApp(
      'Shelf caption',
      ['/api/media?src=https%3A%2F%2F3pillars.pythonanywhere.com%2Fmedia%2Fa.jpg'],
    )

    expect(result).toBe('shared-combined')
    expect(share).toHaveBeenCalledTimes(1)
    expect(shareWithImage.openWhatsAppWithText).not.toHaveBeenCalled()
  })

  it('shares images then opens WhatsApp when text+files is rejected', async () => {
    const share = vi.fn(async (data: ShareData) => {
      if (data.text && data.files?.length) return
      if (data.files?.length && !data.text) return
      throw new Error('unexpected share payload')
    })
    const canShare = vi.fn((data: ShareData) => {
      if (data.text && data.files?.length) return false
      return Boolean(data.files?.length)
    })

    Object.defineProperty(globalThis, 'navigator', {
      value: { share, canShare },
      configurable: true,
    })

    const result = await shareProductsListOnWhatsApp(
      'Shelf caption',
      ['/api/media?src=https%3A%2F%2F3pillars.pythonanywhere.com%2Fmedia%2Fa.jpg'],
    )

    expect(result).toBe('shared-split')
    expect(share).toHaveBeenCalled()
    expect(shareWithImage.openWhatsAppWithText).toHaveBeenCalledWith('Shelf caption')
  })
})
