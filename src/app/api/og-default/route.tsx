/**
 * Branded Open Graph fallback — monogram + site name when no product collage is available.
 */

import { ImageResponse } from 'next/og'
import { getSiteSettingsMap, coerceSiteString } from '@/lib/site-settings'

export const runtime = 'edge'

const OG_SIZE = { width: 1200, height: 630 }

function companyMonogram(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length >= 2) {
    return `${parts[0][0] || ''}${parts[1][0] || ''}`.toUpperCase()
  }
  return (name.trim().slice(0, 2) || 'PP').toUpperCase()
}

export async function GET() {
  const settings = await getSiteSettingsMap()
  const siteName = coerceSiteString(settings.site_name) || 'Past and Present'
  const tagline = coerceSiteString(settings.site_tagline) || 'Vintage & Modern Treasures'
  const monogram = companyMonogram(siteName)

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #8B4513 0%, #D4A574 50%, #2C5282 100%)',
          color: '#fff',
          fontFamily: 'Georgia, serif',
          padding: 80,
          textAlign: 'center',
        }}
      >
        <div
          style={{
            fontSize: 180,
            fontWeight: 700,
            lineHeight: 1,
            letterSpacing: -4,
            textShadow: '0 6px 20px rgba(0,0,0,0.2)',
          }}
        >
          {monogram}
        </div>
        <div
          style={{
            marginTop: 40,
            fontSize: 56,
            fontWeight: 600,
            letterSpacing: -1,
          }}
        >
          {siteName}
        </div>
        {tagline ? (
          <div
            style={{
              marginTop: 16,
              fontSize: 28,
              opacity: 0.9,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
            }}
          >
            {tagline}
          </div>
        ) : null}
      </div>
    ),
    { ...OG_SIZE },
  )
}
