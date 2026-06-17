import { describe, expect, it } from 'vitest'
import { inferImageContentType } from '@/lib/media-proxy'

describe('inferImageContentType', () => {
  it('keeps upstream image/* types', () => {
    expect(inferImageContentType('/media/x.webp', 'image/png')).toBe('image/png')
  })

  it('maps octet-stream webp paths to image/webp', () => {
    expect(
      inferImageContentType(
        'https://3pillars.pythonanywhere.com/media/companies/x/products/y.webp',
        'application/octet-stream',
      ),
    ).toBe('image/webp')
  })

  it('maps octet-stream png paths to image/png', () => {
    expect(
      inferImageContentType(
        'https://3pillars.pythonanywhere.com/media/companies/x/products/y.png',
        'application/octet-stream',
      ),
    ).toBe('image/png')
  })
})
