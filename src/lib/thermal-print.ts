export type ThermalPaperSize = '58mm' | '80mm' | '100mm' | 'full'

export const THERMAL_PAPER_OPTIONS: Array<{
  id: ThermalPaperSize
  label: string
  hint: string
  pageSize: string
  previewWidth: string
}> = [
  {
    id: '80mm',
    label: '80mm thermal',
    hint: 'Most common receipt / label printers (3.15")',
    pageSize: '80mm auto',
    previewWidth: '80mm',
  },
  {
    id: '58mm',
    label: '58mm thermal',
    hint: 'Narrow receipt printers (2.28")',
    pageSize: '58mm auto',
    previewWidth: '58mm',
  },
  {
    id: '100mm',
    label: '100mm label',
    hint: 'Wide shipping / shelf labels (~4")',
    pageSize: '100mm auto',
    previewWidth: '100mm',
  },
  {
    id: 'full',
    label: 'Full page',
    hint: 'A4 / Letter — image fills the sheet',
    pageSize: 'auto',
    previewWidth: '100%',
  },
]

const PAPER_STORAGE_KEY = 'thermal-print-paper'
const THERMAL_MODE_STORAGE_KEY = 'thermal-print-thermal'

export function readStoredThermalPaperSize(): ThermalPaperSize {
  if (typeof window === 'undefined') return '80mm'
  const v = window.sessionStorage.getItem(PAPER_STORAGE_KEY)
  return THERMAL_PAPER_OPTIONS.some((o) => o.id === v) ? (v as ThermalPaperSize) : '80mm'
}

export function readStoredThermalPrintMode(): boolean {
  if (typeof window === 'undefined') return true
  const v = window.sessionStorage.getItem(THERMAL_MODE_STORAGE_KEY)
  return v !== 'false'
}

export function storeThermalPaperSize(size: ThermalPaperSize): void {
  if (typeof window === 'undefined') return
  window.sessionStorage.setItem(PAPER_STORAGE_KEY, size)
}

export function storeThermalPrintMode(thermal: boolean): void {
  if (typeof window === 'undefined') return
  window.sessionStorage.setItem(THERMAL_MODE_STORAGE_KEY, thermal ? 'true' : 'false')
}

export function thermalPrintPageLimits(paperSize: ThermalPaperSize): {
  maxWidth: number
  maxHeight: number
} {
  // ~203 dpi — typical thermal resolution; keep output inside one square page.
  const mmToPx = (mm: number) => Math.round((mm * 203) / 25.4)
  switch (paperSize) {
    case '58mm':
      return { maxWidth: mmToPx(58), maxHeight: mmToPx(58) }
    case '100mm':
      return { maxWidth: mmToPx(100), maxHeight: mmToPx(100) }
    case 'full':
      return { maxWidth: 800, maxHeight: 1050 }
    case '80mm':
    default:
      return { maxWidth: mmToPx(80), maxHeight: mmToPx(80) }
  }
}

function paperWidthMm(paperSize: ThermalPaperSize): number | null {
  switch (paperSize) {
    case '58mm':
      return 58
    case '80mm':
      return 80
    case '100mm':
      return 100
    default:
      return null
  }
}

/** Exact @page size from rasterised image pixels — one page, no split. */
export function buildThermalImagePageCss(
  paperSize: ThermalPaperSize,
  imageWidthPx: number,
  imageHeightPx: number,
): string {
  const widthMm = paperWidthMm(paperSize)
  if (!widthMm || !imageWidthPx || !imageHeightPx) {
    return buildThermalPageCss(paperSize)
  }

  const heightMm = Math.ceil(((widthMm * imageHeightPx) / imageWidthPx) * 10) / 10

  return `
@media print {
  @page {
    margin: 0;
    size: ${widthMm}mm ${heightMm}mm;
  }
  html, body {
    width: ${widthMm}mm !important;
    height: ${heightMm}mm !important;
    max-width: ${widthMm}mm !important;
    max-height: ${heightMm}mm !important;
    min-height: 0 !important;
    overflow: hidden !important;
    margin: 0 !important;
    padding: 0 !important;
    font-size: 16px !important;
    -webkit-text-size-adjust: none !important;
    text-size-adjust: none !important;
  }
  .thermal-print-page,
  .thermal-print-root,
  .thermal-print-root .sheet,
  .thermal-print-root .page,
  .thermal-print-root .print-image-frame {
    width: ${widthMm}mm !important;
    height: ${heightMm}mm !important;
    max-width: ${widthMm}mm !important;
    max-height: ${heightMm}mm !important;
    min-height: 0 !important;
    margin: 0 !important;
    padding: 0 !important;
    overflow: hidden !important;
    page-break-before: avoid !important;
    break-before: avoid !important;
    page-break-after: avoid !important;
    break-after: avoid !important;
    page-break-inside: avoid !important;
    break-inside: avoid !important;
  }
  .thermal-print-root .print-image {
    width: ${widthMm}mm !important;
    height: ${heightMm}mm !important;
    max-width: ${widthMm}mm !important;
    max-height: ${heightMm}mm !important;
    object-fit: fill !important;
    display: block !important;
    margin: 0 !important;
    page-break-before: avoid !important;
    break-before: avoid !important;
    page-break-after: avoid !important;
    break-after: avoid !important;
    page-break-inside: avoid !important;
    break-inside: avoid !important;
  }
}
`
}

export function buildThermalPageCss(paperSize: ThermalPaperSize): string {
  const option = THERMAL_PAPER_OPTIONS.find((o) => o.id === paperSize) ?? THERMAL_PAPER_OPTIONS[0]
  const fullPage = paperSize === 'full'
  const widthMm = paperWidthMm(paperSize)
  const pageSize = fullPage ? 'auto' : widthMm ? `${widthMm}mm 200mm` : `${option.previewWidth} 200mm`
  return `
@media print {
  @page {
    margin: 0;
    size: ${pageSize};
  }
  html, body {
    width: ${fullPage ? '100%' : option.previewWidth} !important;
    max-width: 100% !important;
    height: auto !important;
    min-height: 0 !important;
    max-height: none !important;
    overflow: hidden !important;
    font-size: 16px !important;
    -webkit-text-size-adjust: none !important;
    text-size-adjust: none !important;
  }
  .thermal-print-page {
    min-height: 0 !important;
    height: auto !important;
    max-height: none !important;
  }
  .thermal-print-page,
  .thermal-print-root,
  .thermal-print-root .sheet,
  .thermal-print-root .page,
  .thermal-print-root .print-image-frame {
    width: 100% !important;
    max-width: 100% !important;
    margin: 0 !important;
    padding: 0 !important;
    overflow: hidden !important;
    page-break-inside: avoid !important;
    break-inside: avoid !important;
  }
}
`
}

export type ThermalPrintImagePayload = {
  dataUrl: string
  width: number
  height: number
}

function thermalPageHeightMm(paperSize: ThermalPaperSize, imageWidthPx: number, imageHeightPx: number): number | null {
  const widthMm = paperWidthMm(paperSize)
  if (!widthMm || !imageWidthPx || !imageHeightPx) return null
  return Math.ceil(((widthMm * imageHeightPx) / imageWidthPx) * 10) / 10
}

/** Print only the rasterised image in an isolated iframe — avoids admin page layout splitting across pages. */
export function printThermalImageOnly(
  image: ThermalPrintImagePayload,
  paperSize: ThermalPaperSize,
): Promise<void> {
  if (typeof document === 'undefined') return Promise.resolve()

  const widthMm = paperWidthMm(paperSize)
  const heightMm = thermalPageHeightMm(paperSize, image.width, image.height)
  const pageSizeRule =
    widthMm && heightMm ? `size: ${widthMm}mm ${heightMm}mm;` : 'size: auto;'
  const bodySizeRule =
    widthMm && heightMm
      ? `width:${widthMm}mm;height:${heightMm}mm;max-width:${widthMm}mm;max-height:${heightMm}mm;`
      : `width:${image.width}px;height:${image.height}px;`
  const imgSizeRule =
    widthMm && heightMm
      ? `width:${widthMm}mm;height:${heightMm}mm;max-width:${widthMm}mm;max-height:${heightMm}mm;`
      : `width:${image.width}px;height:${image.height}px;`

  return new Promise((resolve) => {
    const iframe = document.createElement('iframe')
    iframe.setAttribute('aria-hidden', 'true')
    iframe.style.cssText =
      'position:fixed;top:0;left:0;width:0;height:0;border:none;visibility:hidden;pointer-events:none'
    document.body.appendChild(iframe)

    const win = iframe.contentWindow
    const doc = iframe.contentDocument ?? win?.document
    if (!win || !doc) {
      iframe.remove()
      resolve()
      return
    }

    let finished = false
    const finish = () => {
      if (finished) return
      finished = true
      window.setTimeout(() => iframe.remove(), 600)
      resolve()
    }

    doc.open()
    doc.write(`<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>Print</title>
<style>
  @page { margin: 0; ${pageSizeRule} }
  html, body {
    margin: 0;
    padding: 0;
    overflow: hidden;
    background: #fff;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
    ${bodySizeRule}
  }
  img {
    display: block;
    margin: 0;
    padding: 0;
    border: 0;
    object-fit: fill;
    page-break-inside: avoid;
    break-inside: avoid;
    ${imgSizeRule}
  }
</style></head><body></body></html>`)
    doc.close()

    const img = doc.createElement('img')
    img.alt = 'Flyer'
    img.width = image.width
    img.height = image.height

    let printed = false
    const triggerPrint = () => {
      if (printed) return
      printed = true
      doc.body.appendChild(img)
      win.onafterprint = finish
      window.setTimeout(finish, 15000)
      win.focus()
      win.print()
    }

    img.onload = triggerPrint
    img.onerror = finish
    img.src = image.dataUrl

    if (img.complete && img.naturalHeight > 0) {
      triggerPrint()
    }
  })
}

export const THERMAL_PRINT_CSS = `
  .thermal-print-root * { box-sizing: border-box; }
  .thermal-print-root {
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  .thermal-print-root .sheet {
    width: 100%;
    margin: 0 auto;
    background: #fff;
  }
  .thermal-print-root .page {
    width: 100%;
    padding: 0;
    margin: 0;
    text-align: center;
  }
  .thermal-print-root .print-image-frame {
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    background: #fff;
  }
  .thermal-print-root .print-image {
    width: 100%;
    max-width: 100%;
    height: auto;
    display: block;
    margin: 0 auto;
  }
  .thermal-print-root[data-rasterized="true"] .print-image,
  .thermal-print-root[data-rasterized="true"][data-thermal="true"] .print-image {
    filter: none !important;
    -webkit-filter: none !important;
  }
  .thermal-print-root[data-thermal="true"]:not([data-rasterized="true"]) .print-image {
    filter: grayscale(100%) contrast(1.15);
    -webkit-filter: grayscale(100%) contrast(1.15);
  }

  @media print {
    html, body {
      background: #fff !important;
      margin: 0 !important;
      padding: 0 !important;
    }
    body.thermal-print-active header,
    body.thermal-print-active footer,
    body.thermal-print-active nav,
    body.thermal-print-active [data-print-chrome],
    body.thermal-print-active [data-cookie-consent],
    body.thermal-print-active .no-print {
      display: none !important;
      visibility: hidden !important;
    }
    .thermal-print-page {
      padding: 0 !important;
      background: #fff !important;
      min-height: 0 !important;
      height: auto !important;
    }
    .thermal-print-root .sheet {
      page-break-after: avoid !important;
      break-after: avoid !important;
    }
    .thermal-print-root .page {
      page-break-inside: avoid !important;
      break-inside: avoid !important;
      page-break-after: avoid !important;
      break-after: avoid !important;
    }
    .thermal-print-root .print-image-frame,
    .thermal-print-root .print-image {
      page-break-inside: avoid !important;
      break-inside: avoid !important;
    }
    .thermal-print-root .print-image {
      object-fit: contain !important;
    }
    .thermal-print-root .page + .page {
      page-break-before: always !important;
      break-before: page !important;
    }
    .thermal-print-root[data-thermal="true"] .print-image,
    .thermal-print-root .print-image {
      filter: none !important;
      -webkit-filter: none !important;
    }
  }
`

export type ThermalPrintFlyer = {
  id: string
  label: string
  src: string
  alt: string
}

export const HANDY_MAN_PRINT_FLYERS: ThermalPrintFlyer[] = [
  {
    id: 'electrical',
    label: 'Basic Electrical Repairs — R100',
    src: '/print/one.png',
    alt: 'Basic Electrical Repairs flyer',
  },
  {
    id: 'laptop',
    label: 'Laptop Repairs — R200 + expenses',
    src: '/print/two.png',
    alt: 'Laptop Repairs flyer',
  },
  {
    id: 'ubuntu',
    label: 'Ubuntu & Open Source Installation — R150',
    src: '/print/three.png',
    alt: 'Ubuntu and Open Source Installation flyer',
  },
  {
    id: 'app-dev',
    label: 'Application Development — from R1500',
    src: '/print/four.png',
    alt: 'Application Development flyer',
  },
  {
    id: 'all-services',
    label: 'All services (full grid)',
    src: '/print/five.png',
    alt: 'All Handy Man Computer Repairs services flyer',
  },
]
