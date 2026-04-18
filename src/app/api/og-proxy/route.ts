import { NextRequest } from 'next/server'

/** Only proxy media from the configured API host (prevents open redirect abuse). */
function allowedMediaHostname(): string {
  try {
    return new URL(process.env.NEXT_PUBLIC_API_URL || 'https://3pillars.pythonanywhere.com/api').hostname
  } catch {
    return '3pillars.pythonanywhere.com'
  }
}

/**
 * Serves product images under the storefront domain so WhatsApp/link crawlers
 * fetch og:image from the same site as og:url (avoids cross-domain preview failures).
 */
export async function GET(request: NextRequest) {
  const src = request.nextUrl.searchParams.get('src')
  if (!src || src.length > 2048) {
    return new Response('Bad Request', { status: 400 })
  }

  let upstreamUrl: URL
  try {
    upstreamUrl = new URL(src)
  } catch {
    return new Response('Bad Request', { status: 400 })
  }

  const allowed = allowedMediaHostname()
  if (upstreamUrl.hostname !== allowed) {
    return new Response('Forbidden', { status: 403 })
  }
  if (!upstreamUrl.pathname.startsWith('/media/')) {
    return new Response('Forbidden', { status: 403 })
  }

  const upstream = await fetch(upstreamUrl.toString(), {
    next: { revalidate: 86_400 },
    headers: {
      Accept: 'image/*',
      'User-Agent': 'PastAndPresent-OgProxy/1.0',
    },
  })

  if (!upstream.ok) {
    return new Response('Not Found', { status: 404 })
  }

  const contentType = upstream.headers.get('content-type') || 'image/jpeg'
  const buf = await upstream.arrayBuffer()

  return new Response(buf, {
    status: 200,
    headers: {
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=86400, s-maxage=86400',
    },
  })
}
