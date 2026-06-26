import { useCallback, useEffect, useState } from 'react'
import type { ViewMode } from '../lib/preferences'

const STORAGE_KEY = 'wk-view-mode'
const MOBILE_BREAKPOINT = 900

function getDefaultViewMode(): ViewMode {
  return window.innerWidth <= MOBILE_BREAKPOINT ? 'list' : 'poster'
}

function readStoredViewMode(): ViewMode | null {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored === 'poster' || stored === 'list') return stored
  return null
}

export function useViewMode(initialFromPrefs: ViewMode | null = null) {
  const [viewMode, setViewModeState] = useState<ViewMode>(
    () => initialFromPrefs ?? readStoredViewMode() ?? getDefaultViewMode(),
  )
  const [isMobile, setIsMobile] = useState(
    () => window.innerWidth <= MOBILE_BREAKPOINT,
  )

  useEffect(() => {
    if (initialFromPrefs) setViewModeState(initialFromPrefs)
  }, [initialFromPrefs])

  useEffect(() => {
    const media = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT}px)`)
    const onChange = () => setIsMobile(media.matches)
    onChange()
    media.addEventListener('change', onChange)
    return () => media.removeEventListener('change', onChange)
  }, [])

  const setViewMode = useCallback((mode: ViewMode) => {
    setViewModeState(mode)
    localStorage.setItem(STORAGE_KEY, mode)
  }, [])

  return {
    viewMode,
    setViewMode,
    isMobile,
  }
}

export type { ViewMode }
