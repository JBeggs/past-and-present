'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Loader2, Printer, RotateCcw, RotateCw } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import ThermalPrintImageSheet from '@/components/admin/ThermalPrintImageSheet'
import { nextRotation, type ImageRotation } from '@/lib/thermal-print-image'
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
  const [selectedFlyerId, setSelectedFlyerId] = useState<string | null>(null)
  const [rotation, setRotation] = useState<ImageRotation>(0)
  const [imagePreparing, setImagePreparing] = useState(false)

  const isAuthorized = profile?.role === 'admin' || profile?.role === 'business_owner'

  const selectedFlyer = useMemo(
    () => HANDY_MAN_PRINT_FLYERS.find((f) => f.id === selectedFlyerId) ?? null,
    [selectedFlyerId],
  )

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

  useEffect(() => {
    setRotation(0)
    setImagePreparing(false)
  }, [selectedFlyerId])

  const paperOption = useMemo(
    () => THERMAL_PAPER_OPTIONS.find((o) => o.id === paperSize) ?? THERMAL_PAPER_OPTIONS[0],
    [paperSize],
  )

  const dynamicPageCss = useMemo(() => buildThermalPageCss(paperSize), [paperSize])

  const handlePrint = useCallback(async () => {
    if (!selectedFlyer || imagePreparing) return
    setPrinting(true)
    try {
      const imgs = Array.from(document.querySelectorAll<HTMLImageElement>('.thermal-print-root .print-image'))
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
  }, [selectedFlyer, imagePreparing])

  const handlePreparedChange = useCallback((ready: boolean) => {
    setImagePreparing(!ready)
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
            disabled={printing || !selectedFlyer || imagePreparing}
            className="inline-flex items-center gap-2 rounded-full bg-vintage-primary px-5 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            <Printer className="h-4 w-4" />
            {printing ? 'Preparing…' : 'Print / Save PDF'}
          </button>
        </div>

        <div className="rounded-2xl border border-[#e8e4df] bg-white p-4 text-sm text-[#141414] shadow-sm">
          <p className="mb-1 font-semibold">Print Handy Man flyer</p>
          <p className="mb-3 text-xs text-[#8a837a]">
            Select one flyer, rotate if needed, then print full width for thermal output.
          </p>

          <fieldset className="mb-4">
            <legend className="mb-2 block text-xs font-medium uppercase tracking-wide text-[#8a837a]">
              Choose flyer <span className="text-red-600">*</span>
            </legend>
            <div className="space-y-2">
              {HANDY_MAN_PRINT_FLYERS.map((flyer) => {
                const selected = selectedFlyerId === flyer.id
                return (
                  <label
                    key={flyer.id}
                    className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition ${
                      selected
                        ? 'border-vintage-primary bg-vintage-primary/5 ring-1 ring-vintage-primary'
                        : 'border-[#e8e4df] bg-[#faf9f7] hover:border-[#d8d4cf]'
                    }`}
                  >
                    <input
                      type="radio"
                      name="flyer"
                      value={flyer.id}
                      checked={selected}
                      onChange={() => setSelectedFlyerId(flyer.id)}
                      className="h-4 w-4 shrink-0 accent-vintage-primary"
                    />
                    <img
                      src={flyer.src}
                      alt=""
                      className="h-14 w-20 shrink-0 rounded border border-[#ece8e3] bg-white object-contain"
                    />
                    <span className="text-sm font-medium leading-snug">{flyer.label}</span>
                  </label>
                )
              })}
            </div>
            {!selectedFlyer ? (
              <p className="mt-2 text-xs text-[#8a837a]">Pick a flyer to enable printing.</p>
            ) : null}
          </fieldset>

          {selectedFlyer ? (
            <div className="mb-4">
              <span className="mb-2 block text-xs font-medium uppercase tracking-wide text-[#8a837a]">
                Rotation
              </span>
              <div className="flex items-center justify-between gap-3 rounded-xl border border-[#e8e4df] bg-[#faf9f7] p-3">
                <button
                  type="button"
                  onClick={() => setRotation((r) => nextRotation(r, 'ccw'))}
                  className="inline-flex items-center gap-1 rounded-lg border border-[#e8e4df] bg-white px-3 py-2 text-xs font-medium"
                >
                  <RotateCcw className="h-4 w-4" />
                  Left
                </button>
                <span className="text-sm font-semibold tabular-nums">{rotation}°</span>
                <button
                  type="button"
                  onClick={() => setRotation((r) => nextRotation(r, 'cw'))}
                  className="inline-flex items-center gap-1 rounded-lg border border-[#e8e4df] bg-white px-3 py-2 text-xs font-medium"
                >
                  Right
                  <RotateCw className="h-4 w-4" />
                </button>
              </div>
            </div>
          ) : null}

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
                Greyscale + high contrast — baked into the image before print.
              </span>
            </span>
          </label>

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

      {selectedFlyer ? (
        <ThermalPrintImageSheet
          flyer={selectedFlyer}
          rotation={rotation}
          paperSize={paperSize}
          thermalMode={thermalMode}
          previewWidth={paperOption.previewWidth}
          onPreparedChange={handlePreparedChange}
        />
      ) : (
        <p className="no-print mx-auto max-w-lg text-center text-sm text-[#8a837a]">
          Select a flyer above to see the print preview.
        </p>
      )}
    </div>
  )
}
