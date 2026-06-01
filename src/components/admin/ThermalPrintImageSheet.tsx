'use client'

import {
  THERMAL_PRINT_CSS,
  type ThermalPaperSize,
  type ThermalPrintFlyer,
} from '@/lib/thermal-print'

type ThermalPrintImageSheetProps = {
  flyers: ThermalPrintFlyer[]
  paperSize?: ThermalPaperSize
  thermalMode?: boolean
  previewWidth?: string
}

export default function ThermalPrintImageSheet({
  flyers,
  paperSize = '80mm',
  thermalMode = true,
  previewWidth = '80mm',
}: ThermalPrintImageSheetProps) {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: THERMAL_PRINT_CSS }} />
      <div
        className="thermal-print-root mx-auto"
        data-thermal={thermalMode ? 'true' : 'false'}
        data-paper={paperSize}
        style={{ maxWidth: previewWidth, width: '100%' }}
      >
        <div className="sheet">
          {flyers.map((flyer) => (
            <section key={flyer.id} className="page">
              <img className="print-image" src={flyer.src} alt={flyer.alt} />
            </section>
          ))}
        </div>
      </div>
    </>
  )
}
