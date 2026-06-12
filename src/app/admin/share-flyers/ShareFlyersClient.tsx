'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Loader2, RotateCcw, RotateCw } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import FlyerImagePreview from '@/components/admin/ThermalPrintImageSheet'
import {
  buildFlyerWhatsAppMessage,
  DEFAULT_FLYER_SITE_URL,
  shareFlyerOnWhatsApp,
} from '@/lib/flyer-share'
import {
  nextRotation,
  type ImageRotation,
  type PreparedFlyerImage,
} from '@/lib/thermal-print-image'
import { HANDY_MAN_PRINT_FLYERS } from '@/lib/thermal-print'

export default function ShareFlyersClient() {
  const { profile, loading: authLoading } = useAuth()
  const router = useRouter()
  const [selectedFlyerId, setSelectedFlyerId] = useState<string | null>(null)
  const [titleText, setTitleText] = useState('')
  const [siteUrl, setSiteUrl] = useState(DEFAULT_FLYER_SITE_URL)
  const [rotation, setRotation] = useState<ImageRotation>(0)
  const [imagePreparing, setImagePreparing] = useState(false)
  const [sharing, setSharing] = useState(false)
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
    if (selectedFlyer) {
      setTitleText(selectedFlyer.label)
    } else {
      setTitleText('')
    }
  }, [selectedFlyerId, selectedFlyer])

  const handlePreparedChange = useCallback((ready: boolean) => {
    setImagePreparing(!ready)
  }, [])

  const handlePreparedImage = useCallback((image: PreparedFlyerImage | null) => {
    preparedImageRef.current = image
  }, [])

  const canShare =
    Boolean(selectedFlyer) &&
    titleText.trim().length > 0 &&
    siteUrl.trim().length > 0 &&
    !sharing &&
    (rotation === 0
      ? true
      : !imagePreparing && Boolean(preparedImageRef.current))

  const handleShareWhatsApp = useCallback(async () => {
    if (!selectedFlyer || !canShare) return

    setSharing(true)
    const origin = typeof window !== 'undefined' ? window.location.origin : ''
    const msg = buildFlyerWhatsAppMessage({ title: titleText, siteUrl })

    try {
      await shareFlyerOnWhatsApp({
        message: msg,
        flyerSrc: selectedFlyer.shareSrc,
        flyerId: selectedFlyer.id,
        origin,
        rotation,
        prepared: preparedImageRef.current,
      })
    } finally {
      setSharing(false)
    }
  }, [selectedFlyer, canShare, titleText, siteUrl, rotation])

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
        </div>

        <div className="rounded-2xl border border-[#e8e4df] bg-white p-4 text-sm text-[#141414] shadow-sm">
          <p className="mb-1 font-semibold">Share Handy Man flyers on WhatsApp</p>
          <p className="mb-3 text-xs text-[#8a837a]">
            Select a flyer, edit the message and site link, rotate if needed, then share. On
            supported devices, WhatsApp opens with your text and the flyer image.
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
                      src={flyer.shareSrc}
                      alt=""
                      className="h-14 w-20 shrink-0 rounded border border-[#ece8e3] bg-white object-contain"
                    />
                    <span className="text-sm font-medium leading-snug">{flyer.label}</span>
                  </label>
                )
              })}
            </div>
          </fieldset>

          {selectedFlyer ? (
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="flyer-title-text"
                  className="mb-2 block text-xs font-medium uppercase tracking-wide text-[#8a837a]"
                >
                  Title / message text <span className="text-red-600">*</span>
                </label>
                <textarea
                  id="flyer-title-text"
                  rows={4}
                  value={titleText}
                  onChange={(e) => setTitleText(e.target.value)}
                  className="w-full rounded-xl border border-[#e8e4df] bg-[#faf9f7] px-3 py-2 text-sm leading-snug text-[#141414] focus:border-vintage-primary focus:outline-none focus:ring-1 focus:ring-vintage-primary"
                  placeholder="Message sent with the flyer image"
                />
              </div>

              <div>
                <label
                  htmlFor="flyer-site-url"
                  className="mb-2 block text-xs font-medium uppercase tracking-wide text-[#8a837a]"
                >
                  Site URL <span className="text-red-600">*</span>
                </label>
                <input
                  id="flyer-site-url"
                  type="url"
                  value={siteUrl}
                  onChange={(e) => setSiteUrl(e.target.value)}
                  className="w-full rounded-xl border border-[#e8e4df] bg-[#faf9f7] px-3 py-2 text-sm text-[#141414] focus:border-vintage-primary focus:outline-none focus:ring-1 focus:ring-vintage-primary"
                  placeholder={DEFAULT_FLYER_SITE_URL}
                />
                <p className="mt-1 text-xs text-[#8a837a]">
                  Appended after your message. `https://` is added automatically if omitted.
                </p>
              </div>

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

              <button
                type="button"
                onClick={() => void handleShareWhatsApp()}
                disabled={!canShare}
                aria-busy={sharing}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-[#25D366] py-3 px-6 text-base font-semibold text-white transition-colors hover:bg-[#20bd5a] disabled:opacity-60"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488" />
                </svg>
                {sharing ? 'Preparing…' : imagePreparing ? 'Preparing image…' : 'Share on WhatsApp'}
              </button>
            </div>
          ) : (
            <p className="text-xs text-[#8a837a]">Pick a flyer to edit the message and share.</p>
          )}
        </div>
      </div>

      {selectedFlyer ? (
        <div className="mx-auto max-w-4xl">
          <p className="mb-2 text-center text-xs font-medium uppercase tracking-wide text-[#8a837a]">
            Image preview
          </p>
          <FlyerImagePreview
            flyer={selectedFlyer}
            imageSrc={selectedFlyer.shareSrc}
            rotation={rotation}
            onPreparedChange={handlePreparedChange}
            onPreparedImage={handlePreparedImage}
          />
        </div>
      ) : (
        <p className="mx-auto max-w-lg text-center text-sm text-[#8a837a]">
          Select a flyer above to see the preview.
        </p>
      )}
    </div>
  )
}
