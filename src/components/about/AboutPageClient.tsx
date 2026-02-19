'use client'

import { useEffect, useState, useRef } from 'react'
import { motion, useInView } from 'framer-motion'

const fadeInUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
}

const staggerContainer = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08, delayChildren: 0.15 },
  },
}

const staggerItem = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
}

export interface AnimatedSectionProps {
  id: string
  children: React.ReactNode
  className?: string
  stagger?: boolean
}

export function AnimatedSection({ id, children, className = '', stagger = false }: AnimatedSectionProps) {
  const ref = useRef<HTMLElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-80px 0px -80px 0px' })

  return (
    <motion.section
      id={id}
      ref={ref}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      variants={stagger ? staggerContainer : fadeInUp}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className={`scroll-mt-32 ${className}`}
    >
      {children}
    </motion.section>
  )
}

export function AnimatedCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      variants={staggerItem}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

export interface AboutSection {
  id: string
  label: string
}

export interface AboutPageClientProps {
  sections: AboutSection[]
  children: React.ReactNode
}

export default function AboutPageClient({ sections, children }: AboutPageClientProps) {
  const [activeSection, setActiveSection] = useState(sections[0]?.id || '')

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id)
          }
        })
      },
      { rootMargin: '-20% 0px -70% 0px', threshold: 0 }
    )

    sections.forEach(({ id }) => {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    })

    return () => observer.disconnect()
  }, [sections])

  return (
    <>
      {/* Sticky navigation */}
      <nav
        className="sticky top-[73px] z-40 bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm"
        aria-label="Page sections"
        data-cy="about-nav"
      >
        <div className="container-wide">
          <div className="flex gap-1 overflow-x-auto py-3 no-scrollbar scroll-smooth">
            {sections.map(({ id, label }) => (
              <a
                key={id}
                href={`#${id}`}
                className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                  activeSection === id
                    ? 'bg-vintage-primary text-white'
                    : 'text-text-muted hover:text-vintage-primary hover:bg-vintage-primary/5'
                }`}
              >
                {label}
              </a>
            ))}
          </div>
        </div>
      </nav>

      {children}
    </>
  )
}
