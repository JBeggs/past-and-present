import type { Metadata } from 'next'
import PrintFlyersClient from './PrintFlyersClient'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Print flyers — Admin',
  robots: { index: false, follow: false },
}

export default function AdminPrintFlyersPage() {
  return <PrintFlyersClient />
}
