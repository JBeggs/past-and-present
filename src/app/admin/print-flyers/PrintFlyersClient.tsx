'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Loader2, Printer } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import ThermalPrintImageSheet from '@/components/admin/ThermalPrintImageSheet'
import {
  buildThermalPageCss,
  HANDY_MAN_PRINT_FLYERS,
  readStoredThermalPaperSize,
  readStoredThermalPrintMode,
  storeThermalPaperSize,
  storeThermalPrintMode,
  THERMAL_PAPER_OPTIONS,
  type ThermalPaperSize,
} from '@/lib/thermal-print'

const THERMAL_PRINT_BODY_CLASS = 'thermal-print-active'

export default function PrintFlyersClient() {
  const { profile, loading: authLoading } = useAuth()
  const router = useRouter()
  const [printing, setPrinting] = useState(false)
  const [paperSize, setPaperSize] = useState<ThermalPaperSize>('80mm')
  const [thermalMode, setThermalMode] = useState(true)

  const isAuthorized = profile?.role === 'admin' || profile?.role === 'business_owner'

  useEffect(() => {
    setPaperSize(readStoredThermalPaperSize())
    setThermalMode(readStoredThermalPrintMode())
    document.body.classList.add(THERMAL_PRINT_BODY_CLASS)
    return () => {
      document.body.classList.remove(THERMAL_PRINT_BODY_CLASS)
    }
  }, [])

  useEffect(() => {
    if (!authLoading && !isAuthorized) {
      router.replace('/login')
    }
  }, [authLoading, isAuthorized, router])

  const paperOption = useMemo(
    () => THERMAL_PAPER_OPTIONS.find((o) => o.id === paperSize) ?? THERMAL_PAPER_OPTIONS[0],
    [paperSize],
  )

  const dynamicPageCss = useMemo(() => buildThermalPageCss(paperSize), [paperSize])

  const handlePrint = useCallback(async () => {
    setPrinting(true)
    try {
      const imgs = Array.from(document.querySelectorAll<HTMLImageElement>('.thermal-print-root img'))
      await Promise.all(
        imgs.map((img) =>
          Promise.race([
            (async () => {
              if (img.complete && img.naturalHeight > 0) return
              if (typeof img.decode === 'function') {
                try {
                  await img.decode()
                  if (img.naturalHeight > 0) return
                } catch {
                  /* continue */
                }
              }
              await new Promise<void>((resolve) => {
                if (img.complete && img.naturalHeight > 0) {
                  resolve()
                  return
                }
                img.addEventListener('load', () => resolve(), { once: true })
                img.addEventListener('error', () => resolve(), { once: true })
              })
            })(),
            new Promise<void>((resolve) => window.setTimeout(resolve, 8000)),
          ]),
        ),
      )
      window.print()
    } finally {
      setPrinting(false)
    }
  }, [])

  if (authLoading || !isAuthorized) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-vintage-primary" />
      </div>
    )
  }

  return (
    <div className="thermal-print-page min-h-screen bg-[#f3f1ed] px-4 py-6" data-thermal-print-page>
      <style dangerouslySetInnerHTML={{ __html: dynamicPageCss }} />

      <div data-print-chrome className="no-print mx-auto mb-6 max-w-lg space-y-4">
        <div className="flex items-center justify-between gap-3">
          <Link
            href="/admin/inventory"
            className="inline-flex items-center gap-2 rounded-full border border-[#e8e4df] bg-white px-4 py-2 text-sm font-medium text-[#141414]"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to admin
          </Link>
          <button
            type="button"
            onClick={() => void handlePrint()}
            disabled={printing}
            className="inline-flex items-center gap-2 rounded-full bg-vintage-primary px-5 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            <Printer className="h-4 w-4" />
            {printing ? 'Preparing…' : 'Print / Save PDF'}
          </button>
        </div>

        <div className="rounded-2xl border border-[#e8e4df] bg-white p-4 text-sm text-[#141414] shadow-sm">
          <p className="mb-1 font-semibold">Print Handy Man flyers</p>
          <p className="mb-3 text-xs text-[#8a837a]">
            Two flyers — each prints on its own page, full width for thermal output.
          </p>

          <label className="mb-3 block">
            <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-[#8a837a]">
              Paper width
            </span>
            <select
              value={paperSize}
              onChange={(e) => {
                const value = e.target.value as ThermalPaperSize
                setPaperSize(value)
                storeThermalPaperSize(value)
              }}
              className="w-full rounded-lg border border-[#e8e4df] bg-white px-3 py-2 text-sm"
            >
              {THERMAL_PAPER_OPTIONS.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
            <span className="mt-1 block text-xs text-[#8a837a]">{paperOption.hint}</span>
          </label>

          <label className="flex items-start gap-3">
            <input
              type="checkbox"
              checked={thermalMode}
              onChange={(e) => {
                setThermalMode(e.target.checked)
                storeThermalPrintMode(e.target.checked)
              }}
              className="mt-1 h-4 w-4 rounded border-[#e8e4df]"
            />
            <span>
              <span className="font-medium">Thermal printer mode</span>
              <span className="mt-0.5 block text-xs text-[#8a837a]">
                Greyscale + high contrast — best for receipt and label printers.
              </span>
            </span>
          </label>

          <ul className="mt-4 space-y-2 text-xs text-[#5c574f]">
            {HANDY_MAN_PRINT_FLYERS.map((flyer) => (
              <li key={flyer.id} className="rounded-lg bg-[#faf9f7] px-3 py-2">
                {flyer.label}
              </li>
            ))}
          </ul>

          <div className="mt-4 rounded-lg bg-[#faf9f7] p-3 text-xs leading-relaxed text-[#5c574f]">
            <p className="font-semibold text-[#141414]">In your print dialog:</p>
            <ul className="mt-2 list-disc space-y-1 pl-4">
              <li>Set margins to <strong>None</strong> (or minimum)</li>
              <li>Turn off <strong>Headers &amp; footers</strong></li>
              <li>Match paper size to your thermal printer width above</li>
            </ul>
          </div>
        </div>
      </div>

      <ThermalPrintImageSheet
        flyers={HANDY_MAN_PRINT_FLYERS}
        paperSize={paperSize}
        thermalMode={thermalMode}
        previewWidth={paperOption.previewWidth}
      />
    </div>
  )
}
