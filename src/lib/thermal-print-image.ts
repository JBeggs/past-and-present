import type { ThermalPaperSize } from '@/lib/thermal-print'

export type ImageRotation = 0 | 90 | 180 | 270

const ROTATIONS: ImageRotation[] = [0, 90, 180, 270]

export function nextRotation(current: ImageRotation, direction: 'cw' | 'ccw'): ImageRotation {
  const index = ROTATIONS.indexOf(current)
  const next = direction === 'cw' ? (index + 1) % 4 : (index + 3) % 4
  return ROTATIONS[next] ?? 0
}

/** Rasterise + optionally greyscale so mobile PDF/thermal print does not fail on huge PNGs or CSS filters. */
export async function prepareThermalPrintImage(
  src: string,
  options: {
    rotation?: ImageRotation
    thermal?: boolean
    maxWidth?: number
    maxHeight?: number
  } = {},
): Promise<string | null> {
  const { rotation = 0, thermal = true, maxWidth = 640, maxHeight = 640 } = options

  return new Promise((resolve) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      try {
        const naturalW = img.naturalWidth
        const naturalH = img.naturalHeight
        if (!naturalW || !naturalH) {
          resolve(null)
          return
        }

        const swap = rotation === 90 || rotation === 270
        const basisW = swap ? naturalH : naturalW
        const basisH = swap ? naturalW : naturalH
        // Fit inside one page — critical for 90°/270° so PDF does not spill to page 2.
        const scale = Math.min(1, maxWidth / basisW, maxHeight / basisH)
        const outW = Math.max(1, Math.round(basisW * scale))
        const outH = Math.max(1, Math.round(basisH * scale))
        const drawW = Math.round(naturalW * scale)
        const drawH = Math.round(naturalH * scale)

        const canvas = document.createElement('canvas')
        canvas.width = outW
        canvas.height = outH
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          resolve(null)
          return
        }

        ctx.fillStyle = '#ffffff'
        ctx.fillRect(0, 0, outW, outH)

        if (thermal) {
          ctx.filter = 'grayscale(1) contrast(1.15)'
        }

        ctx.save()
        ctx.translate(outW / 2, outH / 2)
        ctx.rotate((rotation * Math.PI) / 180)
        ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH)
        ctx.restore()

        const dataUrl = canvas.toDataURL('image/jpeg', 0.88)
        resolve(dataUrl.startsWith('data:image') ? dataUrl : null)
      } catch {
        resolve(null)
      }
    }
    img.onerror = () => resolve(null)
    img.src = src
  })
}
