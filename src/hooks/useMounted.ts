'use client'

import { useSyncExternalStore } from 'react'

/**
 * Returns true only after the component has mounted on the client.
 * Use to avoid hydration mismatches with auth/cart or other client-only state.
 */
export function useMounted() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  )
}
