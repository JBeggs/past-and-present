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

export function buildThermalPageCss(paperSize: ThermalPaperSize): string {
  const option = THERMAL_PAPER_OPTIONS.find((o) => o.id === paperSize) ?? THERMAL_PAPER_OPTIONS[0]
  const fullPage = paperSize === 'full'
  return `
@media print {
  @page {
    margin: 0;
    size: ${option.pageSize};
  }
  html, body {
    width: ${fullPage ? '100%' : option.previewWidth} !important;
    max-width: 100% !important;
    height: auto !important;
    min-height: ${fullPage ? '100vh' : 'auto'} !important;
    font-size: 16px !important;
    -webkit-text-size-adjust: none !important;
    text-size-adjust: none !important;
  }
  .thermal-print-page,
  .thermal-print-root,
  .thermal-print-root .sheet {
    width: 100% !important;
    max-width: 100% !important;
    margin: 0 !important;
    padding: 0 !important;
  }
}
`
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
  .thermal-print-root .print-image {
    width: 100%;
    max-width: 100%;
    height: auto;
    display: block;
    margin: 0 auto;
  }
  .thermal-print-root[data-thermal="true"] .print-image {
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
      min-height: auto !important;
    }
    .thermal-print-root .page {
      page-break-inside: avoid !important;
      break-inside: avoid !important;
    }
    .thermal-print-root .page + .page {
      page-break-before: always !important;
      break-before: page !important;
    }
    .thermal-print-root[data-thermal="true"] .print-image,
    .thermal-print-root .print-image {
      filter: grayscale(100%) contrast(1.15) !important;
      -webkit-filter: grayscale(100%) contrast(1.15) !important;
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
    id: 'flyer-1',
    label: 'Services grid (with appliance icons)',
    src: '/print/handy-man-flyer-1.png',
    alt: 'Handy Man Computer Repairs services flyer with icons',
  },
  {
    id: 'flyer-2',
    label: 'Services grid (large phone number)',
    src: '/print/handy-man-flyer-2.png',
    alt: 'Handy Man Computer Repairs services flyer with phone number',
  },
]
