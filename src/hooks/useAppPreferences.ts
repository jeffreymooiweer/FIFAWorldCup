import { useCallback, useEffect, useMemo, useState } from 'react'
import type { AppPreferences } from '../lib/preferences'
import {
  persistPreferences,
  resolveInitialPreferences,
  writePreferencesToUrl,
} from '../lib/preferences'
import { applyTournamentTheme } from '../config/tournament'
import { getEditionConfig } from '../config/editions/registry'

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

  const setYear = useCallback((year: number) => setPrefs({ year }), [setPrefs])
  const setViewModePref = useCallback(
    (viewMode: AppPreferences['viewMode']) => setPrefs({ viewMode }),
    [setPrefs],
  )
  const setGroup = useCallback((group: string | null) => setPrefs({ group }), [setPrefs])

  return {
    prefs,
    edition,
    setYear,
    setViewModePref,
    setGroup,
    setPrefs,
  }
}
