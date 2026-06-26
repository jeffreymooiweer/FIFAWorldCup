import { useEffect, useState } from 'react'
import {
  discoverAvailableYears,
  getCachedAvailableYears,
  getDiscoveryDelayMs,
} from '../lib/availableYears'
import { getMaxSelectableYear } from '../lib/worldCupYears'

export function useAvailableYears() {
  const [availableYears, setAvailableYears] = useState<number[]>(
    () => getCachedAvailableYears() ?? [getMaxSelectableYear()],
  )
  const [loading, setLoading] = useState(false)

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
