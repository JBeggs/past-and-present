import { describe, expect, it } from 'vitest'
import {
  buildFlyerWhatsAppMessage,
  DEFAULT_FLYER_SITE_URL,
  normalizeSiteUrl,
} from './flyer-share'

describe('normalizeSiteUrl', () => {
  it('returns default when empty', () => {
    expect(normalizeSiteUrl('')).toBe(DEFAULT_FLYER_SITE_URL)
  })

  it('prepends https when scheme missing', () => {
    expect(normalizeSiteUrl('example.com')).toBe('https://example.com')
  })

  it('preserves https URL', () => {
    expect(normalizeSiteUrl('https://past-and-present.co.za')).toBe(
      'https://past-and-present.co.za',
    )
  })
})

describe('buildFlyerWhatsAppMessage', () => {
  it('joins title and site with blank line', () => {
    const msg = buildFlyerWhatsAppMessage({
      title: 'Laptop Repairs — R200',
      siteUrl: 'past-and-present.co.za',
    })
    expect(msg).toBe('Laptop Repairs — R200\n\nhttps://past-and-present.co.za')
  })
})
