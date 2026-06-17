import { inferImageContentType, sniffImageContentType } from '@/lib/media-proxy'

/** Share text plus optional image(s) via Web Share API; returns true when handled. */

export function isMobileDevice(userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : ''): boolean {
  return /Android|iPhone|iPad|iPod|Mobile/i.test(userAgent)
}

/** WhatsApp deep link — native app on mobile, wa.me on desktop. */
export function buildWhatsAppShareUrl(message: string, userAgent?: string): string {
  const text = encodeURIComponent(message)
  if (isMobileDevice(userAgent)) {
    return `whatsapp://send?text=${text}`
  }
  return `https://wa.me/?text=${text}`
}

/**
 * Open WhatsApp with prefilled text.
 * On mobile, same-tab navigation / anchor click opens the native app; window.open often stays in the browser.
 */
export function openWhatsAppWithText(message: string): void {
  if (typeof window === 'undefined') return

  const url = buildWhatsAppShareUrl(message)

  if (isMobileDevice()) {
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.rel = 'noopener noreferrer'
    anchor.style.display = 'none'
    document.body.appendChild(anchor)
    anchor.click()
    document.body.removeChild(anchor)
    return
  }

  window.open(url, '_blank', 'noopener,noreferrer')
}

/** Resolve SSR absolute URLs against the current browser origin for same-origin fetch + Web Share. */
export function resolveShareImageFetchUrl(mediaPath: string): string {
  if (!mediaPath) return ''
  if (mediaPath.startsWith('http://') || mediaPath.startsWith('https://')) {
    try {
      const parsed = new URL(mediaPath)
      if (typeof window !== 'undefined') {
        return `${window.location.origin}${parsed.pathname}${parsed.search}`
      }
    } catch {
      return mediaPath
    }
  }
  if (typeof window !== 'undefined' && mediaPath.startsWith('/')) {
    return `${window.location.origin}${mediaPath}`
  }
  return mediaPath
}

async function tryNavigatorShare(shareData: ShareData): Promise<boolean> {
  if (typeof navigator === 'undefined' || !('share' in navigator)) return false
  if (navigator.canShare && !navigator.canShare(shareData)) return false
  await navigator.share(shareData)
  return true
}

export async function shareTextWithOptionalImage(
  message: string,
  imageUrl: string | string[],
  filename = 'share.jpg',
): Promise<boolean> {
  const urls = (Array.isArray(imageUrl) ? imageUrl : [imageUrl]).filter(Boolean)
  if (typeof navigator === 'undefined' || !('share' in navigator)) {
    return false
  }

  try {
    const files: File[] = []
    for (let i = 0; i < urls.length; i++) {
      const fetchUrl = resolveShareImageFetchUrl(urls[i])
      if (!fetchUrl) continue
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
      files.push(
        new File([blob], urls.length > 1 ? `share-${i + 1}.${ext}` : filename.replace(/\.[^.]+$/, `.${ext}`), {
          type: mime,
        }),
      )
    }

    const tryShareFiles = async (shareFiles: File[], withText: boolean) => {
      const shareData: ShareData = withText
        ? { text: message, files: shareFiles }
        : { files: shareFiles }
      return tryNavigatorShare(shareData)
    }

    if (files.length) {
      // WhatsApp on Android often drops images when text+files are shared together.
      if (files.length === 1) {
        if (await tryShareFiles([files[0]], false)) return true
        if (await tryShareFiles([files[0]], true)) return true
      } else {
        if (await tryShareFiles(files, false)) return true
        if (await tryShareFiles(files, true)) return true
        if (await tryShareFiles([files[0]], false)) return true
      }
    }

    if (await tryNavigatorShare({ text: message })) return true
    return false
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') return true
    return false
  }
}
