type YocoPopupOptions = {
  amountInCents: number
  currency?: string
  name?: string
  description?: string
  metadata?: Record<string, string>
}

type YocoPopupResult = {
  id: string
  status?: string
  error?: { message?: string; status?: string }
}

declare global {
  interface Window {
    YocoSDK?: new (opts: { publicKey: string }) => {
      showPopup: (opts: YocoPopupOptions) => Promise<YocoPopupResult>
    }
  }
}

const YOCO_SDK_SRC = 'https://js.yoco.com/sdk/v1/yoco-sdk-web.js'

let sdkLoadPromise: Promise<void> | null = null

function loadYocoSdk(): Promise<void> {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('Yoco payments are only available in the browser'))
  }
  if (window.YocoSDK) return Promise.resolve()
  if (sdkLoadPromise) return sdkLoadPromise

  sdkLoadPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${YOCO_SDK_SRC}"]`)
    if (existing) {
      existing.addEventListener('load', () => resolve(), { once: true })
      existing.addEventListener('error', () => reject(new Error('Failed to load Yoco SDK')), { once: true })
      if (window.YocoSDK) resolve()
      return
    }

    const script = document.createElement('script')
    script.src = YOCO_SDK_SRC
    script.async = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Failed to load Yoco SDK'))
    document.head.appendChild(script)
  })

  return sdkLoadPromise
}

export async function showYocoPaymentPopup(opts: {
  publicKey: string
  amountInCents: number
  currency?: string
  name?: string
  description?: string
  metadata?: Record<string, string>
}): Promise<YocoPopupResult> {
  await loadYocoSdk()
  if (!window.YocoSDK) {
    throw new Error('Yoco SDK failed to initialize')
  }

  const yoco = new window.YocoSDK({ publicKey: opts.publicKey })
  const result = await yoco.showPopup({
    amountInCents: opts.amountInCents,
    currency: opts.currency ?? 'ZAR',
    name: opts.name ?? 'Past and Present',
    description: opts.description ?? 'Order payment',
    metadata: opts.metadata,
  })

  if (result?.error) {
    throw new Error(result.error.message || 'Payment was cancelled or failed')
  }
  if (!result?.id) {
    throw new Error('Payment did not return a token')
  }

  return result
}
