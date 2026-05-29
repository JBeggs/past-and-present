import { describe, expect, it } from 'vitest'
import {
  buildArticleShareImageUrl,
  buildArticleWhatsAppMessage,
} from '@/lib/article-share'

describe('buildArticleWhatsAppMessage', () => {
  it('includes title, excerpt, url, and site name', () => {
    const msg = buildArticleWhatsAppMessage({
      title: 'Screen printing in Pretoria',
      excerpt: 'How local shops get started.',
      pageUrl: 'https://past-and-present.co.za/articles/screen-printing',
      siteName: 'Past and Present',
    })
    expect(msg).toContain('Screen printing in Pretoria')
    expect(msg).toContain('How local shops get started.')
    expect(msg).toContain('https://past-and-present.co.za/articles/screen-printing')
    expect(msg).toContain('Read on Past and Present')
  })
})

describe('buildArticleShareImageUrl', () => {
  it('proxies article image through same-origin og path', () => {
    process.env.NEXT_PUBLIC_SITE_URL = 'https://past-and-present.co.za'
    const url = buildArticleShareImageUrl(
      {
        title: 'Test',
        featured_media: {
          thumbnail_url: '/media/news/hero-thumb.jpg',
          file_url: '/media/news/hero.jpg',
        },
      },
      'https://past-and-present.co.za',
    )
    expect(url).toContain('past-and-present.co.za')
    expect(url).toMatch(/\/api\/(media|og-proxy)/)
  })
})
