import { useEffect, useState } from 'react'
import {
  discoverAvailableYears,
  getCachedAvailableYears,
  getDiscoveryDelayMs,
} from '../lib/availableYears'
import { getMaxSelectableYear } from '../lib/worldCupYears'

/** Editions with bundled or verified support — always selectable before async discovery. */
export function getDefaultAvailableYears(): number[] {
  const current = getMaxSelectableYear()
  const defaults = [current, 2022, 2018]
  return [...new Set(defaults)].sort((a, b) => b - a)
}

export function useAvailableYears() {
  const cached = getCachedAvailableYears()
  const [availableYears, setAvailableYears] = useState<number[]>(
    () => cached ?? getDefaultAvailableYears(),
  )
  const [loading, setLoading] = useState(() => cached === null)

  useEffect(() => {
    let cancelled = false

    const runDiscovery = async () => {
      setLoading(true)
      try {
        const years = await discoverAvailableYears()
        if (!cancelled) setAvailableYears(years)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    const delay = getDiscoveryDelayMs()
    const timer = window.setTimeout(() => {
      void runDiscovery()
    }, delay)

    return () => {
      cancelled = true
      window.clearTimeout(timer)
    }
  }, [])

  return { availableYears, loading }
}
