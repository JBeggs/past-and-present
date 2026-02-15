'use client'

import { useState } from 'react'
import { X } from 'lucide-react'

interface BulkEditModalProps {
  onClose: () => void
  onSubmit: (data: Record<string, unknown>) => Promise<void>
  count: number
}

export default function BulkEditModal({ onClose, onSubmit, count }: BulkEditModalProps) {
  const [status, setStatus] = useState<string>('')
  const [featured, setFeatured] = useState<string>('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const data: Record<string, unknown> = {}
    if (status) data.status = status
    if (featured === 'true') data.featured = true
    if (featured === 'false') data.featured = false
    if (Object.keys(data).length === 0) {
      onClose()
      return
    }
    setSubmitting(true)
    try {
      await onSubmit(data)
      onClose()
    } finally {
      setSubmitting(false)
    }
  }

  const hasChanges = status || featured

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-text">Bulk Edit {count} Products</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-text mb-2">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-vintage-primary focus:border-vintage-primary"
            >
              <option value="">No change</option>
              <option value="active">Active</option>
              <option value="draft">Draft</option>
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-text mb-2">Featured</label>
            <select
              value={featured}
              onChange={(e) => setFeatured(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-vintage-primary focus:border-vintage-primary"
            >
              <option value="">No change</option>
              <option value="true">Yes – Show in Featured</option>
              <option value="false">No – Remove from Featured</option>
            </select>
          </div>
          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-gray-200 text-text hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !hasChanges}
              className="px-4 py-2 btn btn-primary disabled:opacity-50"
            >
              {submitting ? 'Updating...' : 'Update'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
