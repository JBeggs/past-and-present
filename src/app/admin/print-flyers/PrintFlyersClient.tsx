'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Download, Loader2, RotateCcw, RotateCw } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import FlyerImagePreview from '@/components/admin/ThermalPrintImageSheet'
import {
  downloadPreparedImage,
  nextRotation,
  type ImageRotation,
  type PreparedFlyerImage,
} from '@/lib/thermal-print-image'
import { HANDY_MAN_PRINT_FLYERS } from '@/lib/thermal-print'

export default function PrintFlyersClient() {
  const { profile, loading: authLoading } = useAuth()
  const router = useRouter()
  const [selectedFlyerId, setSelectedFlyerId] = useState<string | null>(null)
  const [rotation, setRotation] = useState<ImageRotation>(0)
  const [imagePreparing, setImagePreparing] = useState(false)
  const preparedImageRef = useRef<PreparedFlyerImage | null>(null)

  const isAuthorized = profile?.role === 'admin' || profile?.role === 'business_owner'

  const selectedFlyer = useMemo(
    () => HANDY_MAN_PRINT_FLYERS.find((f) => f.id === selectedFlyerId) ?? null,
    [selectedFlyerId],
  )

  useEffect(() => {
    if (!authLoading && !isAuthorized) {
      router.replace('/login')
    }
  }, [authLoading, isAuthorized, router])

  useEffect(() => {
    setRotation(0)
    setImagePreparing(false)
    preparedImageRef.current = null
  }, [selectedFlyerId])

  const handleDownload = useCallback(() => {
    const prepared = preparedImageRef.current
    if (!selectedFlyer || imagePreparing || !prepared) return
    const suffix = rotation === 0 ? '' : `-${rotation}deg`
    downloadPreparedImage(prepared, `${selectedFlyer.id}${suffix}.png`)
  }, [selectedFlyer, imagePreparing, rotation])

  const handlePreparedChange = useCallback((ready: boolean) => {
    setImagePreparing(!ready)
  }, [])

  const handlePreparedImage = useCallback((image: PreparedFlyerImage | null) => {
    preparedImageRef.current = image
  }, [])

  if (authLoading || !isAuthorized) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-vintage-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f3f1ed] px-4 py-6">
      <div className="mx-auto mb-6 max-w-lg space-y-4">
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
            onClick={handleDownload}
            disabled={!selectedFlyer || imagePreparing}
            className="inline-flex items-center gap-2 rounded-full bg-vintage-primary px-5 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            <Download className="h-4 w-4" />
            Download PNG
          </button>
        </div>

        <div className="rounded-2xl border border-[#e8e4df] bg-white p-4 text-sm text-[#141414] shadow-sm">
          <p className="mb-1 font-semibold">Handy Man flyers</p>
          <p className="mb-3 text-xs text-[#8a837a]">
            Select a flyer, rotate if needed, then download the full-size PNG.
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
              <p className="mt-2 text-xs text-[#8a837a]">Pick a flyer to enable download.</p>
            ) : null}
          </fieldset>

          {selectedFlyer ? (
            <div>
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
        </div>
      </div>

      {selectedFlyer ? (
        <FlyerImagePreview
          flyer={selectedFlyer}
          rotation={rotation}
          onPreparedChange={handlePreparedChange}
          onPreparedImage={handlePreparedImage}
        />
      ) : (
        <p className="mx-auto max-w-lg text-center text-sm text-[#8a837a]">
          Select a flyer above to see the preview.
        </p>
      )}
    </div>
  )
}
