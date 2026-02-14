'use client'

import { useState } from 'react'
import { ecommerceApi } from '@/lib/api'
import { MapPin, Search, Loader2 } from 'lucide-react'

export interface PudoLocation {
  id: string
  name: string
  address: string
  city: string
  postal_code?: string
  postalCode?: string
  province?: string
  country?: string
}

interface PudoLocationSelectorProps {
  selectedLocation: PudoLocation | null
  onSelect: (location: PudoLocation | null) => void
  disabled?: boolean
}

export function PudoLocationSelector({ selectedLocation, onSelect, disabled }: PudoLocationSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [locations, setLocations] = useState<PudoLocation[]>([])
  const [searching, setSearching] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSearch = async () => {
    if (!searchQuery.trim()) return
    setSearching(true)
    setError(null)
    try {
      const response = await ecommerceApi.pudo.locations({ search: searchQuery.trim() }) as any
      const data = response?.data ?? response?.results ?? (Array.isArray(response) ? response : [])
      setLocations(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Pudo search error:', err)
      setError('Failed to search locations. Please try again.')
      setLocations([])
    } finally {
      setSearching(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSearch()
    }
  }

  return (
    <div className="space-y-4">
      <label className="form-label">Search for Pudo Pickup Point</label>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Enter suburb or postal code"
            className="form-input pl-10"
            disabled={disabled}
          />
        </div>
        <button
          type="button"
          onClick={handleSearch}
          disabled={disabled || searching || !searchQuery.trim()}
          className="btn btn-secondary px-4 flex items-center gap-2"
        >
          {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
          Search
        </button>
      </div>

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}

      {locations.length > 0 && (
        <div className="space-y-2 max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-2">
          {locations.map((loc) => {
            const isSelected = selectedLocation?.id === loc.id
            const postalCode = loc.postal_code || loc.postalCode || ''
            return (
              <button
                key={loc.id}
                type="button"
                onClick={() => onSelect(isSelected ? null : loc)}
                className={`w-full text-left p-3 rounded-lg border transition-colors ${
                  isSelected
                    ? 'border-vintage-primary bg-vintage-primary/5'
                    : 'border-gray-200 hover:border-vintage-primary/50 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-start gap-2">
                  <MapPin className={`w-4 h-4 mt-0.5 flex-shrink-0 ${isSelected ? 'text-vintage-primary' : 'text-text-muted'}`} />
                  <div>
                    <div className="font-medium text-text">{loc.name}</div>
                    <div className="text-sm text-text-muted">
                      {loc.address}
                      {loc.city && `, ${loc.city}`}
                      {postalCode && ` ${postalCode}`}
                    </div>
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      )}

      {selectedLocation && (
        <div className="p-3 bg-vintage-primary/5 border border-vintage-primary/20 rounded-lg">
          <p className="text-sm font-medium text-vintage-primary">Selected pickup point</p>
          <p className="text-sm text-text">{selectedLocation.name}</p>
          <p className="text-xs text-text-muted">
            {selectedLocation.address}, {selectedLocation.city}
            {(selectedLocation.postal_code || selectedLocation.postalCode) && ` ${selectedLocation.postal_code || selectedLocation.postalCode}`}
          </p>
          <button
            type="button"
            onClick={() => onSelect(null)}
            className="text-sm text-vintage-primary hover:underline mt-1"
          >
            Change
          </button>
        </div>
      )}
    </div>
  )
}
