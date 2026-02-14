import { serverNewsApi } from '@/lib/api-server'
import Link from 'next/link'
import { MobileNav } from './MobileNav'
import ClientHeader from './ClientHeader'

async function getHeaderData() {
  try {
    const settingsData: any = await serverNewsApi.siteSettings.list()
    const settingsArray = Array.isArray(settingsData) ? settingsData : (settingsData?.results || [])
    const settingsMap: Record<string, any> = {}
    
    settingsArray.forEach((setting: any) => {
      try {
        settingsMap[setting.key] = setting.type === 'json' 
          ? JSON.parse(setting.value) 
          : setting.value
      } catch {
        settingsMap[setting.key] = setting.value
      }
    })

    const menuItems = [
      { title: 'Products', href: '/products' },
      { title: 'Vintage', href: '/products?condition=vintage' },
      { title: 'Articles', href: '/articles' },
      { title: 'About', href: '/about' },
    ]

    return {
      siteName: settingsMap.site_name || 'Past and Present',
      tagline: settingsMap.site_tagline || 'Vintage & Modern Treasures',
      logo: settingsMap.site_logo,
      menuItems
    }
  } catch (error) {
    console.error('Error fetching header data:', error)
    return {
      siteName: 'Past and Present',
      tagline: 'Vintage & Modern Treasures',
      logo: null,
      menuItems: [
        { title: 'Products', href: '/products' },
        { title: 'Vintage', href: '/products?condition=vintage' },
        { title: 'Articles', href: '/articles' },
        { title: 'About', href: '/about' },
      ]
    }
  }
}

export async function Header() {
  const { siteName, tagline, menuItems, logo } = await getHeaderData()
  const logoUrl = logo || '/logo.png'
  const useLogoImage = !!logo

  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
      {/* Top Bar - Minimal utility strip */}
      <div className="bg-vintage-primary text-white/95">
        <div className="container-wide">
          <div className="flex items-center justify-between py-1.5 text-xs md:text-sm">
            <span className="font-playfair italic tracking-wide">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
            <div className="flex items-center gap-6">
              <Link href="/contact" className="hover:text-white/90 transition-colors">Contact</Link>
              <Link href="/faq" className="hover:text-white/90 transition-colors">FAQ</Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Header - Typography-led brand (logo from settings only; else wordmark) */}
      <div className="container-wide">
        <div className="flex items-center justify-between py-4 md:py-5">
          <Link href="/" className="flex items-center gap-4 group">
            {useLogoImage && (
              <img src={logoUrl} alt="" className="h-9 w-auto object-contain opacity-90 group-hover:opacity-100 transition-opacity" aria-hidden />
            )}
            <div className="flex flex-col">
              <span className="text-xl md:text-2xl font-playfair font-semibold text-text tracking-tight">
                {siteName}
              </span>
              <span className="text-[11px] md:text-xs text-text-muted tracking-[0.2em] uppercase font-medium">
                {tagline}
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-8 md:gap-10">
            <nav className="hidden md:flex items-center gap-8">
              <Link href="/" className="text-sm font-medium text-text-light hover:text-vintage-primary transition-colors">Home</Link>
              {menuItems.map((item) => (
                <Link key={item.href} href={item.href} className="text-sm font-medium text-text-light hover:text-vintage-primary transition-colors">
                  {item.title}
                </Link>
              ))}
            </nav>
            <div className="hidden md:block">
              <ClientHeader />
            </div>
          </div>

          <MobileNav menuItems={menuItems} />
        </div>
      </div>
    </header>
  )
}
