import { openGraphImageFromMediaUrl } from '@/lib/product-seo'

type ArticleShareInput = {
  title: string
  excerpt?: string | null
  subtitle?: string | null
  seo_description?: string | null
  slug?: string
  social_image?: { file_url?: string | null; thumbnail_url?: string | null } | null
  featured_media?: { file_url?: string | null; thumbnail_url?: string | null } | null
}

function pickArticleShareImageRaw(article?: ArticleShareInput | null): string {
  for (const media of [article?.social_image, article?.featured_media]) {
    const thumb = media?.thumbnail_url?.trim()
    if (thumb) return thumb
    const full = media?.file_url?.trim()
    if (full) return full
  }
  return ''
}

/** Same-origin proxied image for og:image and WhatsApp file share. */
export function buildArticleShareImageUrl(
  article: ArticleShareInput,
  siteOrigin?: string | null,
): string {
  const raw = pickArticleShareImageRaw(article)
  return openGraphImageFromMediaUrl(raw || null, siteOrigin)
}

export function buildArticleWhatsAppMessage(input: {
  title: string
  excerpt?: string | null
  subtitle?: string | null
  seo_description?: string | null
  pageUrl: string
  siteName?: string
}): string {
  const { title, pageUrl, siteName = 'Past and Present' } = input
  const blurb = (input.excerpt || input.seo_description || input.subtitle || '')
    .replace(/\s+/g, ' ')
    .trim()

  return [
    title,
    blurb,
    pageUrl,
    siteName ? `Read on ${siteName}` : '',
  ]
    .filter(Boolean)
    .join('\n\n')
}
