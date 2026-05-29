'use client'

import { useState } from 'react'
import { Share2, Facebook, Twitter, Linkedin, Link2, Mail, Check } from 'lucide-react'

import { buildArticleWhatsAppMessage } from '@/lib/article-share'
import { getPublicSiteOrigin } from '@/lib/media-proxy'
import { openWhatsAppWithText, shareTextWithOptionalImage } from '@/lib/share-with-image'

interface ShareButtonsProps {
  title: string
  url: string
  siteOrigin?: string
  excerpt?: string | null
  subtitle?: string | null
  seoDescription?: string | null
  shareImageUrl?: string
  siteName?: string
  articleSlug?: string
}

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488" />
    </svg>
  )
}

export default function ShareButtons({
  title,
  url,
  siteOrigin,
  excerpt,
  subtitle,
  seoDescription,
  shareImageUrl,
  siteName = 'Past and Present',
  articleSlug,
}: ShareButtonsProps) {
  const [showShareMenu, setShowShareMenu] = useState(false)
  const [copied, setCopied] = useState(false)
  const [sharingWhatsApp, setSharingWhatsApp] = useState(false)

  const configuredOrigin = (siteOrigin || getPublicSiteOrigin() || '').replace(/\/$/, '')

  const fullUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}${url}`
      : configuredOrigin
        ? `${configuredOrigin}${url}`
        : url.startsWith('http')
          ? url
          : url

  const encodedTitle = encodeURIComponent(title)
  const encodedUrl = encodeURIComponent(fullUrl)

  const shareLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    twitter: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    email: `mailto:?subject=${encodedTitle}&body=Check out this article: ${fullUrl}`,
  }

  const copyToClipboard = async () => {
    try {
      if (typeof window !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(fullUrl)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      }
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const openShare = (platform: keyof typeof shareLinks) => {
    window.open(shareLinks[platform], '_blank', 'width=600,height=400')
    setShowShareMenu(false)
  }

  const shareWhatsApp = async () => {
    if (sharingWhatsApp) return
    setSharingWhatsApp(true)
    const msg = buildArticleWhatsAppMessage({
      title,
      excerpt,
      subtitle,
      seo_description: seoDescription,
      pageUrl: fullUrl,
      siteName,
    })

    try {
      if (shareImageUrl) {
        const shared = await shareTextWithOptionalImage(
          msg,
          shareImageUrl,
          `${articleSlug || 'article'}.jpg`,
        )
        if (shared) {
          setShowShareMenu(false)
          return
        }
      }
    } finally {
      setSharingWhatsApp(false)
    }

    openWhatsAppWithText(msg)
    setShowShareMenu(false)
  }

  return (
    <div className="fixed bottom-6 right-6 z-40">
      {showShareMenu && (
        <>
          <div
            className="fixed inset-0 -z-10"
            onClick={() => setShowShareMenu(false)}
            aria-hidden="true"
          />

          <div className="absolute bottom-16 right-0 min-w-[220px] rounded-xl border border-gray-200 bg-white p-4 shadow-2xl">
            <h3 className="mb-3 text-sm font-semibold text-text">Share article</h3>
            <p className="mb-3 text-xs text-text-muted">
              WhatsApp includes the headline and hero image when your device supports it.
            </p>

            <div className="space-y-2">
              <button
                type="button"
                onClick={shareWhatsApp}
                disabled={sharingWhatsApp}
                aria-busy={sharingWhatsApp}
                className="flex w-full items-center rounded-lg px-3 py-2 text-left transition-colors hover:bg-green-50 disabled:opacity-70"
              >
                <div className="mr-3 flex h-8 w-8 items-center justify-center rounded-full bg-[#25D366]">
                  <WhatsAppIcon className="h-4 w-4 text-white" />
                </div>
                <span className="text-text">{sharingWhatsApp ? 'Preparing…' : 'WhatsApp'}</span>
              </button>

              <button
                type="button"
                onClick={() => openShare('facebook')}
                className="flex w-full items-center rounded-lg px-3 py-2 text-left transition-colors hover:bg-blue-50"
              >
                <div className="mr-3 flex h-8 w-8 items-center justify-center rounded-full bg-blue-600">
                  <Facebook className="h-4 w-4 text-white" />
                </div>
                <span className="text-text">Facebook</span>
              </button>

              <button
                type="button"
                onClick={() => openShare('twitter')}
                className="flex w-full items-center rounded-lg px-3 py-2 text-left transition-colors hover:bg-blue-50"
              >
                <div className="mr-3 flex h-8 w-8 items-center justify-center rounded-full bg-blue-400">
                  <Twitter className="h-4 w-4 text-white" />
                </div>
                <span className="text-text">Twitter</span>
              </button>

              <button
                type="button"
                onClick={() => openShare('linkedin')}
                className="flex w-full items-center rounded-lg px-3 py-2 text-left transition-colors hover:bg-blue-50"
              >
                <div className="mr-3 flex h-8 w-8 items-center justify-center rounded-full bg-blue-700">
                  <Linkedin className="h-4 w-4 text-white" />
                </div>
                <span className="text-text">LinkedIn</span>
              </button>

              <button
                type="button"
                onClick={() => openShare('email')}
                className="flex w-full items-center rounded-lg px-3 py-2 text-left transition-colors hover:bg-gray-50"
              >
                <div className="mr-3 flex h-8 w-8 items-center justify-center rounded-full bg-gray-600">
                  <Mail className="h-4 w-4 text-white" />
                </div>
                <span className="text-text">Email</span>
              </button>

              <button
                type="button"
                onClick={copyToClipboard}
                className="flex w-full items-center rounded-lg px-3 py-2 text-left transition-colors hover:bg-gray-50"
              >
                <div className="mr-3 flex h-8 w-8 items-center justify-center rounded-full bg-gray-500">
                  {copied ? (
                    <Check className="h-4 w-4 text-white" />
                  ) : (
                    <Link2 className="h-4 w-4 text-white" />
                  )}
                </div>
                <span className="text-text">{copied ? 'Copied!' : 'Copy link'}</span>
              </button>
            </div>
          </div>
        </>
      )}

      <button
        type="button"
        onClick={() => setShowShareMenu(!showShareMenu)}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-vintage-primary text-white shadow-lg transition-all duration-200 hover:bg-vintage-primary/90 hover:shadow-xl"
        aria-label="Share article"
      >
        <Share2 className="h-6 w-6" />
      </button>
    </div>
  )
}
