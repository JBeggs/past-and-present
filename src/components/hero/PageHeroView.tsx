'use client'

import Link from 'next/link'
import { Sparkles } from 'lucide-react'
import type { PageHero } from '@/lib/page-hero'

/** Matches `DefaultHomeHero` so layout does not jump when an image is uploaded. */
const HERO_SECTION_LAYOUT =
  'relative overflow-hidden flex flex-col justify-center min-h-[24rem] sm:min-h-[28rem] md:min-h-[32rem]'

/**
 * Renders the uploaded hero markup. Past-and-present uses a native &lt;img&gt; (no next/image).
 *
 * **Home:** Shop New CTA (plus optional CMS cta_label / cta_href when both are set).
 * Optional CMS `cta_label` / `cta_href` renders as an extra control when both are set.
 */
export default function PageHeroView({
  hero,
  pageSlug,
}: {
  hero: PageHero
  pageSlug: string
}) {
  const isHome = pageSlug === 'home'
  const hasCta = Boolean(hero.ctaLabel && hero.ctaHref)

  const heading = hero.title?.trim() || null

  return (
    <section className={HERO_SECTION_LAYOUT}>
      <div className="absolute inset-0">
        <img
          src={hero.imageUrl ?? ''}
          alt=""
          fetchPriority={isHome ? 'high' : undefined}
          className="absolute inset-0 w-full h-full object-cover"
          onError={(e) => {
            ;(e.target as HTMLImageElement).src = '/images/products/default.svg'
          }}
        />
        <div
          className="absolute inset-0 bg-gradient-to-br from-vintage-primary/85 via-vintage-primary/55 to-vintage-accent/55"
          aria-hidden
        />
      </div>

      <div className="relative container-wide py-24 md:py-32 text-white w-full">
        <div className="max-w-2xl">
          {heading && (
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-playfair mb-4">{heading}</h1>
          )}

          {hero.subtitle?.trim() && (
            <p className="text-lg md:text-xl text-green-100 mb-8 max-w-xl">{hero.subtitle}</p>
          )}

          {isHome && (
            <div className="flex flex-wrap gap-4">
              {hasCta && (
                <Link href={hero.ctaHref!} className="btn btn-secondary text-base px-6 py-3">
                  {hero.ctaLabel}
                </Link>
              )}
              <Link href="/products?category=new-arrivals" className="btn bg-white text-vintage-primary hover:bg-gray-100 text-base px-6 py-3">
                <Sparkles className="w-5 h-5 mr-2" />
                Shop New
              </Link>
              <Link href="/products" className="btn btn-secondary text-base px-6 py-3">
                Shop All
              </Link>
            </div>
          )}

          {!isHome && hasCta && (
            <div className="flex flex-wrap gap-4">
              <Link href={hero.ctaHref!} className="btn btn-accent text-base px-6 py-3">
                {hero.ctaLabel}
              </Link>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
