import type { PreparedFlyerImage } from '@/lib/thermal-print-image'
import { openWhatsAppWithText, shareTextWithOptionalImage } from '@/lib/share-with-image'

export const DEFAULT_FLYER_SITE_URL = 'https://past-and-present.co.za'

export function normalizeSiteUrl(input: string): string {
  const trimmed = input.trim()
  if (!trimmed) return DEFAULT_FLYER_SITE_URL
  if (/^https?:\/\//i.test(trimmed)) return trimmed
  return `https://${trimmed}`
}

export function buildFlyerWhatsAppMessage(input: {
  title: string
  siteUrl: string
}): string {
  const title = input.title.trim()
  const site = normalizeSiteUrl(input.siteUrl)
  const lines: string[] = []
  if (title) lines.push(title)
  if (site) {
    if (lines.length) lines.push('')
    lines.push(site)
  }
  return lines.join('\n')
}

export function absoluteFlyerImageUrl(relativeSrc: string, origin: string): string {
  try {
    return new URL(relativeSrc, origin).href
  } catch {
    return relativeSrc
  }
}

async function dataUrlToFile(dataUrl: string, filename: string): Promise<File | null> {
  try {
    const res = await fetch(dataUrl, { cache: 'no-store' })
    if (!res.ok) return null
    const blob = await res.blob()
    const ext = blob.type.includes('png') ? 'png' : 'jpg'
    const name = filename.endsWith(`.${ext}`) ? filename : `${filename.replace(/\.[^.]+$/, '')}.${ext}`
    return new File([blob], name, { type: blob.type || 'image/png' })
  } catch {
    return null
  }
}

/** Share message plus raster from prepareFlyerImage (rotated flyers). */
export async function shareTextWithPreparedImage(
  message: string,
  prepared: PreparedFlyerImage,
  filename = 'flyer.png',
): Promise<boolean> {
  if (typeof navigator === 'undefined' || !('share' in navigator)) {
    return false
  }

  try {
    const file = await dataUrlToFile(prepared.dataUrl, filename)
    if (!file) return false

    const shareData: ShareData = { text: message, files: [file] }
    if (navigator.canShare && !navigator.canShare(shareData)) return false
    await navigator.share(shareData)
    return true
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') return true
    return false
  }
}

export async function shareFlyerOnWhatsApp(input: {
  message: string
  flyerSrc: string
  flyerId: string
  origin: string
  rotation: number
  prepared: PreparedFlyerImage | null
}): Promise<void> {
  const { message, flyerSrc, flyerId, origin, rotation, prepared } = input

  let shared = false
  if (rotation === 0) {
    const imageUrl = absoluteFlyerImageUrl(flyerSrc, origin)
    shared = await shareTextWithOptionalImage(message, imageUrl, `${flyerId}.png`)
  } else if (prepared) {
    shared = await shareTextWithPreparedImage(message, prepared, `${flyerId}.png`)
  }

  if (!shared) {
    openWhatsAppWithText(message)
  }
}
