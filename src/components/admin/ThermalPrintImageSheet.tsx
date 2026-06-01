'use client'

import { useEffect, useState } from 'react'
import {
  prepareThermalPrintImage,
  type ImageRotation,
  type PreparedThermalPrintImage,
} from '@/lib/thermal-print-image'
import {
  THERMAL_PRINT_CSS,
  thermalPrintPageLimits,
  type ThermalPaperSize,
  type ThermalPrintFlyer,
} from '@/lib/thermal-print'

type ThermalPrintImageSheetProps = {
  flyer: ThermalPrintFlyer
  rotation?: ImageRotation
  paperSize?: ThermalPaperSize
  thermalMode?: boolean
  previewWidth?: string
  onPreparedChange?: (ready: boolean) => void
  onPreparedImage?: (image: PreparedThermalPrintImage | null) => void
}

export default function ThermalPrintImageSheet({
  flyer,
  rotation = 0,
  paperSize = '80mm',
  thermalMode = true,
  previewWidth = '80mm',
  onPreparedChange,
  onPreparedImage,
}: ThermalPrintImageSheetProps) {
  const [preparedSrc, setPreparedSrc] = useState<string | null>(null)
  const [preparing, setPreparing] = useState(true)

  useEffect(() => {
    let cancelled = false
    setPreparing(true)
    setPreparedSrc(null)
    onPreparedChange?.(false)
    onPreparedImage?.(null)

    const { maxWidth, maxHeight } = thermalPrintPageLimits(paperSize)

    void prepareThermalPrintImage(flyer.src, {
      rotation,
      thermal: thermalMode,
      maxWidth,
      maxHeight,
    }).then((prepared) => {
      if (cancelled) return
      setPreparedSrc(prepared?.dataUrl ?? null)
      setPreparing(false)
      onPreparedChange?.(Boolean(prepared))
      onPreparedImage?.(prepared)
    })

    return () => {
      cancelled = true
    }
  }, [flyer.src, rotation, thermalMode, paperSize, onPreparedChange, onPreparedImage])

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: THERMAL_PRINT_CSS }} />
      <div
        className="thermal-print-root mx-auto"
        data-thermal={thermalMode ? 'true' : 'false'}
        data-rasterized="true"
        data-paper={paperSize}
        style={{ maxWidth: previewWidth, width: '100%' }}
      >
        <div className="sheet">
          <section className="page">
            <div className="print-image-frame">
              {preparing ? (
                <p className="no-print py-8 text-center text-sm text-[#8a837a]">Preparing image…</p>
              ) : null}
              {preparedSrc ? (
                <img className="print-image" src={preparedSrc} alt={flyer.alt} />
              ) : !preparing ? (
                <img className="print-image" src={flyer.src} alt={flyer.alt} />
              ) : null}
            </div>
          </section>
        </div>
      </div>
    </>
  )
}
