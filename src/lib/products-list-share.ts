/**
 * WhatsApp share for the products *listing* page only.
 *
 * Uses proxied product thumbnail URLs (/api/media) — not the dynamic og-products collage,
 * which does not attach reliably via the mobile Web Share API.
 */
import { inferImageContentType, sniffImageContentType } from '@/lib/media-proxy'
import { openWhatsAppWithText, resolveShareImageFetchUrl } from '@/lib/share-with-image'

async function tryNavigatorShare(shareData: ShareData): Promise<boolean> {
  if (typeof navigator === 'undefined' || !('share' in navigator)) return false
  if (navigator.canShare && !navigator.canShare(shareData)) return false
  await navigator.share(shareData)
  return true
}

async function fetchShareImageFiles(
  imageUrls: string[],
  filename = 'products.jpg',
): Promise<File[]> {
  const files: File[] = []
  const urls = imageUrls.filter(Boolean).slice(0, 4)

  for (let i = 0; i < urls.length; i++) {
    const fetchUrl = resolveShareImageFetchUrl(urls[i])
    if (!fetchUrl) continue
    try {
      const res = await fetch(fetchUrl, { cache: 'no-store', credentials: 'same-origin' })
      if (!res.ok) continue
      const blob = await res.blob()
      if (!blob.size) continue
      const buf = new Uint8Array(await blob.arrayBuffer())
      const mime = sniffImageContentType(
        buf,
        inferImageContentType(fetchUrl, blob.type || res.headers.get('content-type')),
      )
      const ext = mime.includes('png') ? 'png' : mime.includes('webp') ? 'webp' : 'jpg'
      const name =
        urls.length > 1
          ? `product-${i + 1}.${ext}`
          : filename.replace(/\.[^.]+$/, `.${ext}`)
      files.push(new File([blob], name, { type: mime }))
    } catch {
      continue
    }
  }

  return files
}

export type ProductsListShareResult =
  | 'shared-combined'
  | 'shared-split'
  | 'shared-text-only'
  | 'cancelled'

/**
 * Share product-list caption plus up to four thumbnail images.
 *
 * 1. text + files (works on iOS and some Android targets)
 * 2. files only, then open WhatsApp with the caption (Android WhatsApp often rejects text+files)
 * 3. wa.me / whatsapp:// with text only when Web Share is unavailable
 */
export async function shareProductsListOnWhatsApp(
  message: string,
  imageUrls: string[],
  filename = 'products.jpg',
): Promise<ProductsListShareResult> {
  const text = message.trim()
  if (!text) return 'cancelled'

  if (typeof navigator === 'undefined' || !('share' in navigator)) {
    openWhatsAppWithText(text)
    return 'shared-text-only'
  }

  try {
    const files = await fetchShareImageFiles(imageUrls, filename)

    if (files.length) {
      if (await tryNavigatorShare({ text, files })) return 'shared-combined'
      if (files.length > 1 && (await tryNavigatorShare({ files }))) {
        openWhatsAppWithText(text)
        return 'shared-split'
      }
      if (await tryNavigatorShare({ files: [files[0]] })) {
        openWhatsAppWithText(text)
        return 'shared-split'
      }
    }

    if (await tryNavigatorShare({ text })) return 'shared-text-only'

    openWhatsAppWithText(text)
    return 'shared-text-only'
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') return 'cancelled'
    openWhatsAppWithText(text)
    return 'shared-text-only'
  }
}
