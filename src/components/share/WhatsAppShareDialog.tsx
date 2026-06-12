'use client'

import { useEffect, useState } from 'react'
import { openWhatsAppWithText, shareTextWithOptionalImage } from '@/lib/share-with-image'

interface WhatsAppShareDialogProps {
  open: boolean
  onClose: () => void
  initialMessage: string
  shareImageUrls: string | string[]
  imageFilename?: string
  title?: string
}

export default function WhatsAppShareDialog({
  open,
  onClose,
  initialMessage,
  shareImageUrls,
  imageFilename = 'share.jpg',
  title = 'Share on WhatsApp',
}: WhatsAppShareDialogProps) {
  const [messageText, setMessageText] = useState(initialMessage)
  const [sharing, setSharing] = useState(false)

  useEffect(() => {
    if (!open) return
    setMessageText(initialMessage)
    setSharing(false)
  }, [open, initialMessage])

  useEffect(() => {
    if (!open) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !sharing) onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, onClose, sharing])

  useEffect(() => {
    if (!open) return
    const body = document.body
    const scrollY = window.scrollY
    const prevOverflow = body.style.overflow
    const prevPosition = body.style.position
    const prevTop = body.style.top
    const prevLeft = body.style.left
    const prevRight = body.style.right
    const prevWidth = body.style.width

    body.style.overflow = 'hidden'
    body.style.position = 'fixed'
    body.style.top = `-${scrollY}px`
    body.style.left = '0'
    body.style.right = '0'
    body.style.width = '100%'

    return () => {
      body.style.overflow = prevOverflow
      body.style.position = prevPosition
      body.style.top = prevTop
      body.style.left = prevLeft
      body.style.right = prevRight
      body.style.width = prevWidth
      window.scrollTo(0, scrollY)
    }
  }, [open])

  const handleShare = async () => {
    if (sharing) return
    const message = messageText.trim()
    if (!message) return

    setSharing(true)
    try {
      const shared = await shareTextWithOptionalImage(message, shareImageUrls, imageFilename)
      if (shared) {
        onClose()
        return
      }
    } finally {
      setSharing(false)
    }

    openWhatsAppWithText(message)
    onClose()
  }

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="whatsapp-share-dialog-title"
      onClick={(event) => {
        if (event.target === event.currentTarget && !sharing) onClose()
      }}
    >
      <div className="w-full max-w-xl rounded-2xl border border-[#e8e4df] bg-white shadow-2xl">
        <div className="p-5">
          <h2 id="whatsapp-share-dialog-title" className="text-xl font-bold font-playfair text-text mb-2">
            {title}
          </h2>
          <p className="text-sm text-text-muted mb-4">
            Edit your message before sharing. WhatsApp image attachment is included on supported devices.
          </p>

          <label htmlFor="whatsapp-share-message" className="mb-2 block text-xs font-medium uppercase tracking-wide text-[#8a837a]">
            Message text
          </label>
          <textarea
            id="whatsapp-share-message"
            rows={8}
            value={messageText}
            onChange={(event) => setMessageText(event.target.value)}
            className="w-full rounded-xl border border-[#e8e4df] bg-[#faf9f7] px-3 py-2 text-sm leading-relaxed text-[#141414] focus:border-vintage-primary focus:outline-none focus:ring-1 focus:ring-vintage-primary"
            placeholder="Write your WhatsApp message"
          />

          <div className="mt-2 flex justify-start">
            <button
              type="button"
              onClick={() => setMessageText(initialMessage)}
              className="text-xs font-medium text-vintage-primary hover:underline"
              disabled={sharing}
            >
              Reset to default
            </button>
          </div>

          <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
              disabled={sharing}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => void handleShare()}
              className="btn btn-primary"
              disabled={sharing || !messageText.trim()}
              aria-busy={sharing}
            >
              {sharing ? 'Preparing…' : 'Share on WhatsApp'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
