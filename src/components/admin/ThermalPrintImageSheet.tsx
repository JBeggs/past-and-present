'use client'

import { useEffect, useState } from 'react'
import {
  prepareFlyerImage,
  type ImageRotation,
  type PreparedFlyerImage,
} from '@/lib/thermal-print-image'
import type { ThermalPrintFlyer } from '@/lib/thermal-print'

type FlyerImagePreviewProps = {
  flyer: ThermalPrintFlyer
  rotation?: ImageRotation
  onPreparedChange?: (ready: boolean) => void
  onPreparedImage?: (image: PreparedFlyerImage | null) => void
}

export default function FlyerImagePreview({
  flyer,
  rotation = 0,
  onPreparedChange,
  onPreparedImage,
}: FlyerImagePreviewProps) {
  const [preparedSrc, setPreparedSrc] = useState<string | null>(null)
  const [preparing, setPreparing] = useState(true)

  useEffect(() => {
    let cancelled = false
    setPreparing(true)
    setPreparedSrc(null)
    onPreparedChange?.(false)
    onPreparedImage?.(null)

    void prepareFlyerImage(flyer.src, rotation).then((prepared) => {
      if (cancelled) return
      setPreparedSrc(prepared?.dataUrl ?? null)
      setPreparing(false)
      onPreparedChange?.(Boolean(prepared))
      onPreparedImage?.(prepared)
    })

    return () => {
      cancelled = true
    }
  }, [flyer.src, rotation, onPreparedChange, onPreparedImage])

  return (
    <div className="mx-auto w-full max-w-4xl">
      <div className="rounded-xl border border-[#e8e4df] bg-white p-2 shadow-sm">
        {preparing ? (
          <p className="py-16 text-center text-sm text-[#8a837a]">Preparing preview…</p>
        ) : preparedSrc ? (
          <img className="mx-auto block h-auto w-full" src={preparedSrc} alt={flyer.alt} />
        ) : (
          <img className="mx-auto block h-auto w-full" src={flyer.src} alt={flyer.alt} />
        )}
      </div>
    </div>
  )
}
