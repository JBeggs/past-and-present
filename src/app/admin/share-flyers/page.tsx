import type { Metadata } from 'next'
import ShareFlyersClient from './ShareFlyersClient'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Share flyers on WhatsApp — Admin',
  robots: { index: false, follow: false },
}

export default function AdminShareFlyersPage() {
  return <ShareFlyersClient />
}
