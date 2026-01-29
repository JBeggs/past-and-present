import { serverNewsApi } from '@/lib/api-server'
import FooterClient from './FooterClient'

async function getFooterData() {
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
      { title: 'Articles', href: '/articles' },
      { title: 'About', href: '/about' },
    ]

    return {
      siteName: settingsMap.site_name || 'Past and Present',
      description: settingsMap.site_description || 'Discover unique vintage treasures and modern finds. Quality second-hand items and new products, all in one place.',
      contact: {
        address: settingsMap.contact_address || '',
        phone: settingsMap.contact_phone || '',
        email: settingsMap.contact_email || ''
      },
      social: {
        facebook: settingsMap.social_facebook || '',
        twitter: settingsMap.social_twitter || '',
        instagram: settingsMap.social_instagram || ''
      },
      menuItems
    }
  } catch (error) {
    console.error('Error fetching footer data:', error)
    return {
      siteName: 'Past and Present',
      description: 'Discover unique vintage treasures and modern finds. Quality second-hand items and new products, all in one place.',
      contact: {
        address: '',
        phone: '',
        email: ''
      },
      social: {
        facebook: '',
        twitter: '',
        instagram: ''
      },
      menuItems: [
        { title: 'Products', href: '/products' },
        { title: 'Articles', href: '/articles' },
        { title: 'About', href: '/about' },
      ]
    }
  }
}

export async function Footer() {
  const { siteName, description, contact, social, menuItems } = await getFooterData()
  
  return (
    <FooterClient siteName={siteName} description={description} contact={contact} social={social} menuItems={menuItems} />
  )
}
