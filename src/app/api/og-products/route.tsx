/**
 * Open Graph image for the products listing — collage of up to four product photos,
 * or the branded default when no images are provided.
 */

import { ImageResponse } from 'next/og'
import { getPublicSiteOrigin, mediaProxyUserAgent } from '@/lib/media-proxy'

export const runtime = 'edge'

const OG_SIZE = { width: 1200, height: 630 }

async function loadImageSrc(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, {
      next: { revalidate: 86_400 },
      headers: {
        Accept: 'image/*',
        'User-Agent': mediaProxyUserAgent(),
      },
    })
    if (!res.ok) return null
    const contentType = res.headers.get('content-type') || 'image/jpeg'
    const buf = await res.arrayBuffer()
    const bytes = new Uint8Array(buf)
    let binary = ''
    for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i])
    return `data:${contentType};base64,${btoa(binary)}`
  } catch {
    return null
  }
}

function collageLayout(count: number): Array<{ left: number; top: number; width: number; height: number }> {
  if (count === 1) return [{ left: 0, top: 0, width: 1200, height: 630 }]
  if (count === 2) {
    return [
      { left: 0, top: 0, width: 600, height: 630 },
      { left: 600, top: 0, width: 600, height: 630 },
    ]
  }
  if (count === 3) {
    return [
      { left: 0, top: 0, width: 600, height: 630 },
      { left: 600, top: 0, width: 600, height: 315 },
      { left: 600, top: 315, width: 600, height: 315 },
    ]
  }
  return [
    { left: 0, top: 0, width: 600, height: 315 },
    { left: 600, top: 0, width: 600, height: 315 },
    { left: 0, top: 315, width: 600, height: 315 },
    { left: 600, top: 315, width: 600, height: 315 },
  ]
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const title = (searchParams.get('title') || 'Products').slice(0, 120)
  const rawUrls = searchParams.getAll('img').slice(0, 4)

  const loaded: string[] = []
  for (const url of rawUrls) {
    const src = await loadImageSrc(url)
    if (src) loaded.push(src)
  }

  if (loaded.length === 0) {
    const site = getPublicSiteOrigin()
    if (site) {
      return Response.redirect(`${site}/api/og-default`, 302)
    }
    return Response.redirect(new URL('/favicon.png', request.url), 302)
  }

  const slots = collageLayout(loaded.length)

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          background: '#1a1a1a',
          position: 'relative',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            width: '100%',
            height: '100%',
            position: 'relative',
          }}
        >
          {loaded.map((src, index) => {
            const slot = slots[index]
            return (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={index}
                src={src}
                alt=""
                style={{
                  position: 'absolute',
                  left: slot.left,
                  top: slot.top,
                  width: slot.width,
                  height: slot.height,
                  objectFit: 'cover',
                }}
              />
            )
          })}
        </div>
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '28px 48px',
            background: 'linear-gradient(transparent, rgba(0,0,0,0.82))',
          }}
        >
          <div
            style={{
              color: '#fff',
              fontSize: 52,
              fontWeight: 700,
              fontFamily: 'Georgia, serif',
              textAlign: 'center',
              lineHeight: 1.15,
              textShadow: '0 2px 12px rgba(0,0,0,0.5)',
            }}
          >
            {title}
          </div>
        </div>
      </div>
    ),
    { ...OG_SIZE },
  )
}
