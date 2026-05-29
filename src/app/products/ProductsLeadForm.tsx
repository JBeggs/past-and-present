'use client'

import { useState } from 'react'
import { useToast } from '@/contexts/ToastContext'
import { submitContactLead } from '@/lib/submit-contact-lead'
import { Send, Tag } from 'lucide-react'

const LEAD_SUBJECT = 'Offer / enquiry from products page'

export default function ProductsLeadForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  })
  const [loading, setLoading] = useState(false)
  const { showSuccess, showError } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await submitContactLead({
        name: formData.name,
        email: formData.email,
        subject: LEAD_SUBJECT,
        message: formData.message,
      })
      showSuccess('Thanks! We\'ve got your offer and will be in touch soon.')
      setFormData({ name: '', email: '', message: '' })
    } catch (error) {
      showError(error instanceof Error ? error.message : 'Failed to send. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card p-8">
      <div className="flex items-start gap-4 mb-6">
        <div className="w-10 h-10 bg-vintage-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
          <Tag className="w-5 h-5 text-vintage-primary" />
        </div>
        <div>
          <h2 className="text-xl font-semibold font-playfair text-text">
            Interested but don&apos;t want to spend so much?
          </h2>
          <p className="text-text-muted">Drop a line with an offer.</p>
        </div>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="lead-name" className="form-label">Name</label>
            <input
              id="lead-name"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="form-input"
              required
            />
          </div>
          <div>
            <label htmlFor="lead-email" className="form-label">Email</label>
            <input
              id="lead-email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="form-input"
              required
            />
          </div>
        </div>
        <div>
          <label htmlFor="lead-message" className="form-label">Your offer</label>
          <textarea
            id="lead-message"
            rows={5}
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            placeholder="Let us know which item(s) you're interested in and what you'd like to offer."
            className="form-input resize-none"
            required
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="btn btn-primary py-3 px-8"
        >
          {loading ? 'Sending...' : 'Send Offer'}
          {!loading && <Send className="w-4 h-4 ml-2" />}
        </button>
      </form>
    </div>
  )
}
