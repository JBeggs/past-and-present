'use client'

import { Suspense, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { authApi } from '@/lib/api'
import { useToast } from '@/contexts/ToastContext'

function ConfirmEmailChangeInner() {
  const sp = useSearchParams()
  const router = useRouter()
  const { showSuccess, showError } = useToast()
  const token = sp.get('token')
  const [phase, setPhase] = useState<'loading' | 'err'>('loading')

  useEffect(() => {
    if (!token) {
      setPhase('err')
      return undefined
    }
    let cancelled = false
    ;(async () => {
      try {
        await authApi.confirmEmailChange(token)
        if (!cancelled) {
          showSuccess('Email address updated.')
          router.push('/profile')
          router.refresh()
        }
      } catch (err: any) {
        if (!cancelled) {
          setPhase('err')
          showError(err?.message || 'Invalid or expired link.')
        }
      }
    })()
    return () => {
      cancelled = true
    }
  }, [token, router, showError, showSuccess])

  return (
    <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-xl border border-vintage-primary/10 text-center">
      {phase === 'loading' ? (
        <div className="flex flex-col items-center gap-3 py-10">
          <Loader2 className="w-10 h-10 animate-spin text-vintage-primary" />
          <p className="text-text-muted text-sm">Confirming your new email…</p>
        </div>
      ) : (
        <>
          <p className="text-text-muted text-sm mb-4">We could not confirm the change.</p>
          <Link href="/profile" className="btn btn-primary w-full py-3">
            Back to profile
          </Link>
        </>
      )}
    </div>
  )
}

export default function ConfirmEmailChangePage() {
  return (
    <div className="min-h-screen bg-vintage-background flex items-center justify-center py-12 px-4">
      <Suspense fallback={<div className="bg-white p-8 rounded-xl text-text-muted">Loading…</div>}>
        <ConfirmEmailChangeInner />
      </Suspense>
    </div>
  )
}
