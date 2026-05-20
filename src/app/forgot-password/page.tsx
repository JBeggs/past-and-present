'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Mail, ArrowLeft } from 'lucide-react'
import { authApi, getApiErrorMessage } from '@/lib/api'
import { useToast } from '@/contexts/ToastContext'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [busy, setBusy] = useState(false)
  const { showSuccess, showError } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setBusy(true)
    try {
      const res = await authApi.requestPasswordReset(email)
      showSuccess(res.detail || 'Check your inbox for reset instructions.')
    } catch (err: any) {
      showError(getApiErrorMessage(err, 'Something went wrong. Try again later.'))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="min-h-screen bg-vintage-background flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-xl border border-vintage-primary/10">
        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-sm text-vintage-primary hover:text-vintage-primary-dark mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to sign in
        </Link>
        <h1 className="text-2xl font-bold font-playfair text-text mb-2">Forgot password</h1>
        <p className="text-text-muted text-sm mb-6">
          Enter your email — if an account exists, we&apos;ll send a reset link valid for the next few days.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="form-label text-sm font-semibold text-text-light">
              Email
            </label>
            <div className="relative mt-1">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-11 pr-3 py-3 bg-gray-50 border border-gray-200 rounded-md focus:ring-vintage-primary/20 focus:border-vintage-primary"
                placeholder="you@example.com"
              />
            </div>
          </div>
          <button type="submit" disabled={busy} className="btn btn-primary w-full py-3">
            {busy ? 'Sending…' : 'Send reset link'}
          </button>
        </form>
      </div>
    </div>
  )
}
