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

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      {/* Top Bar - Vintage Style */}
      <div className="bg-vintage-primary text-white">
        <div className="container-wide">
          <div className="flex items-center justify-between py-2 text-sm">
            <div className="flex items-center space-x-4">
              <span className="font-playfair italic">
                {new Date().toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/contact" className="hover:text-modern-accent transition-colors">Contact</Link>
              <Link href="/faq" className="hover:text-modern-accent transition-colors">FAQ</Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="container-wide">
        <div className="flex items-center justify-between py-4">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-3">
              <img
                src={logoUrl}
                alt={siteName}
                className="h-12 w-auto object-contain"
              />
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold font-playfair text-text">{siteName}</h1>
                <p className="text-sm text-text-muted italic">{tagline}</p>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation & Auth */}
          <div className="flex items-center space-x-8">
            <nav className="hidden md:flex items-center space-x-8">
              <Link href="/" className="nav-link">Home</Link>
              {menuItems.map((item) => (
                <Link key={item.href} href={item.href} className="nav-link">
                  {item.title}
                </Link>
              ))}
            </nav>
            
            {/* Auth Button */}
            <div className="hidden md:block">
              <ClientHeader />
            </div>
          </div>

          {/* Mobile Navigation */}
          <MobileNav menuItems={menuItems} />
        </div>
      </div>
    </header>
  )
}
