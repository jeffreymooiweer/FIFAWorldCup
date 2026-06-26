import { useCallback, useEffect, useMemo, useState } from 'react'
import i18n from '../i18n'
import type { ColorScheme, AppPreferences } from '../lib/preferences'
import {
  persistPreferences,
  resolveInitialPreferences,
  writePreferencesToUrl,
} from '../lib/preferences'
import { applyTournamentTheme } from '../config/tournament'
import { getEditionConfig } from '../config/editions/registry'

function resolveColorScheme(scheme: ColorScheme): 'light' | 'dark' {
  if (scheme === 'system') {
    return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'
  }
  return scheme
}

function applyColorScheme(scheme: ColorScheme): void {
  const resolved = resolveColorScheme(scheme)
  document.documentElement.dataset.colorScheme = resolved
}

export function useAppPreferences() {
  const [prefs, setPrefsState] = useState<AppPreferences>(() => resolveInitialPreferences())

  const edition = useMemo(() => getEditionConfig(prefs.year), [prefs.year])

  const setPrefs = useCallback((patch: Partial<AppPreferences>) => {
    setPrefsState((current) => {
      const next = { ...current, ...patch }
      persistPreferences(next)
      writePreferencesToUrl(next)
      return next
    })
  }, [])

  useEffect(() => {
    applyTournamentTheme(edition.theme)
  }, [edition.theme])

  useEffect(() => {
    applyColorScheme(prefs.colorScheme)
    if (prefs.colorScheme !== 'system') return
    const media = window.matchMedia('(prefers-color-scheme: light)')
    const onChange = () => applyColorScheme('system')
    media.addEventListener('change', onChange)
    return () => media.removeEventListener('change', onChange)
  }, [prefs.colorScheme])

  useEffect(() => {
    if (prefs.language && i18n.language !== prefs.language) {
      void i18n.changeLanguage(prefs.language)
    }
  }, [prefs.language])

  const setYear = useCallback((year: number) => setPrefs({ year }), [setPrefs])
  const setLanguage = useCallback(
    (language: string | null) => setPrefs({ language }),
    [setPrefs],
  )
  const setColorScheme = useCallback(
    (colorScheme: ColorScheme) => setPrefs({ colorScheme }),
    [setPrefs],
  )
  const setViewModePref = useCallback(
    (viewMode: AppPreferences['viewMode']) => setPrefs({ viewMode }),
    [setPrefs],
  )
  const setGroup = useCallback((group: string | null) => setPrefs({ group }), [setPrefs])

  return {
    prefs,
    edition,
    setYear,
    setLanguage,
    setColorScheme,
    setViewModePref,
    setGroup,
    setPrefs,
  }
}
