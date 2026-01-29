'use client'

import Link from 'next/link'
import { Facebook, Twitter, Instagram, Mail, Phone, MapPin } from 'lucide-react'

interface FooterClientProps {
  siteName: string
  description: string
  contact: {
    address: string
    phone: string
    email: string
  }
  social: {
    facebook: string
    twitter: string
    instagram: string
  }
  menuItems: Array<{ title: string; href: string }>
}

export default function FooterClient({ siteName, description, contact, social, menuItems }: FooterClientProps) {
  return (
    <footer className="bg-vintage-primary text-white">
      <div className="container-wide">
        {/* Main Footer Content */}
        <div className="py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* About Section */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-modern-accent to-vintage-accent rounded-lg flex items-center justify-center">
                <span className="text-white font-playfair font-bold text-lg">P&P</span>
              </div>
              <span className="font-bold font-playfair text-lg">{siteName}</span>
            </div>
            <p className="text-green-100 mb-4">{description}</p>
            <div className="flex space-x-4">
              {social.facebook && (
                <a href={social.facebook} target="_blank" rel="noopener noreferrer" className="text-green-200 hover:text-modern-accent transition-colors">
                  <Facebook className="w-5 h-5" />
                </a>
              )}
              {social.twitter && (
                <a href={social.twitter} target="_blank" rel="noopener noreferrer" className="text-green-200 hover:text-modern-accent transition-colors">
                  <Twitter className="w-5 h-5" />
                </a>
              )}
              {social.instagram && (
                <a href={social.instagram} target="_blank" rel="noopener noreferrer" className="text-green-200 hover:text-modern-accent transition-colors">
                  <Instagram className="w-5 h-5" />
                </a>
              )}
            </div>
          </div>

          {/* Shop Links */}
          <div>
            <h3 className="font-semibold font-playfair text-lg mb-4">Shop</h3>
            <ul className="space-y-2">
              <li><Link href="/products" className="text-green-100 hover:text-modern-accent transition-colors">All Products</Link></li>
              <li><Link href="/products?condition=vintage" className="text-green-100 hover:text-modern-accent transition-colors">Vintage Items</Link></li>
              <li><Link href="/products?condition=new" className="text-green-100 hover:text-modern-accent transition-colors">New Arrivals</Link></li>
              {menuItems.slice(0, 3).map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="text-green-100 hover:text-modern-accent transition-colors">
                    {item.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="font-semibold font-playfair text-lg mb-4">Customer Service</h3>
            <ul className="space-y-2">
              <li><Link href="/shipping" className="text-green-100 hover:text-modern-accent transition-colors">Shipping Info</Link></li>
              <li><Link href="/returns" className="text-green-100 hover:text-modern-accent transition-colors">Returns & Exchanges</Link></li>
              <li><Link href="/faq" className="text-green-100 hover:text-modern-accent transition-colors">FAQ</Link></li>
              <li><Link href="/contact" className="text-green-100 hover:text-modern-accent transition-colors">Contact Us</Link></li>
              <li><Link href="/about" className="text-green-100 hover:text-modern-accent transition-colors">About Us</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-semibold font-playfair text-lg mb-4">Contact</h3>
            <div className="space-y-3">
              {contact.address && (
                <div className="flex items-start space-x-2">
                  <MapPin className="w-4 h-4 text-green-200 mt-0.5" />
                  <span className="text-green-100 text-sm">{contact.address}</span>
                </div>
              )}
              {contact.phone && (
                <div className="flex items-center space-x-2">
                  <Phone className="w-4 h-4 text-green-200" />
                  <span className="text-green-100">{contact.phone}</span>
                </div>
              )}
              {contact.email && (
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4 text-green-200" />
                  <span className="text-green-100">{contact.email}</span>
                </div>
              )}
            </div>
            
            {/* Payment Methods */}
            <div className="mt-6">
              <h4 className="font-semibold text-sm mb-2">Secure Payments</h4>
              <p className="text-green-200 text-sm">Powered by Yoco</p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="py-6 border-t border-green-700">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-green-200 text-sm">
              © {new Date().getFullYear()} {siteName}. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link href="/privacy" className="text-green-200 hover:text-modern-accent text-sm transition-colors">Privacy Policy</Link>
              <Link href="/terms" className="text-green-200 hover:text-modern-accent text-sm transition-colors">Terms of Service</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
