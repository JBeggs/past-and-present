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

export function buildThermalPageCss(paperSize: ThermalPaperSize): string {
  const option = THERMAL_PAPER_OPTIONS.find((o) => o.id === paperSize) ?? THERMAL_PAPER_OPTIONS[0]
  const fullPage = paperSize === 'full'
  // Use auto page height — fixed mm heights often break mobile Save-as-PDF.
  const pageSize = fullPage ? 'auto' : `${option.previewWidth} auto`
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
    overflow: visible !important;
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
    .thermal-print-root .print-image {
      max-height: 100% !important;
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
