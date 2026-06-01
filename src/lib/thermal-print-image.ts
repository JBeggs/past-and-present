export type ImageRotation = 0 | 90 | 180 | 270

const ROTATIONS: ImageRotation[] = [0, 90, 180, 270]

export function nextRotation(current: ImageRotation, direction: 'cw' | 'ccw'): ImageRotation {
  const index = ROTATIONS.indexOf(current)
  const next = direction === 'cw' ? (index + 1) % 4 : (index + 3) % 4
  return ROTATIONS[next] ?? 0
}

export type PreparedFlyerImage = {
  dataUrl: string
  width: number
  height: number
}

/** Rotate at full resolution — no downscale, no greyscale. */
export async function prepareFlyerImage(
  src: string,
  rotation: ImageRotation = 0,
): Promise<PreparedFlyerImage | null> {
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
        const outW = swap ? naturalH : naturalW
        const outH = swap ? naturalW : naturalH

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
        ctx.save()
        ctx.translate(outW / 2, outH / 2)
        ctx.rotate((rotation * Math.PI) / 180)
        ctx.drawImage(img, -naturalW / 2, -naturalH / 2, naturalW, naturalH)
        ctx.restore()

        const dataUrl = canvas.toDataURL('image/png')
        if (!dataUrl.startsWith('data:image')) {
          resolve(null)
          return
        }
        resolve({ dataUrl, width: outW, height: outH })
      } catch {
        resolve(null)
      }
    }
    img.onerror = () => resolve(null)
    img.src = src
  })
}

export function downloadPreparedImage(image: PreparedFlyerImage, filename: string): void {
  const link = document.createElement('a')
  link.href = image.dataUrl
  link.download = filename.endsWith('.png') ? filename : `${filename}.png`
  link.rel = 'noopener'
  document.body.appendChild(link)
  link.click()
  link.remove()
}
