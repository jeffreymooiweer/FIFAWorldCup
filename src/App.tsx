import { useCallback, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { AppToolbar } from './components/AppToolbar'
import { BracketPoster } from './components/BracketPoster'
import { DataAttribution } from './components/DataAttribution'
import { MobileListView } from './components/MobileListView'
import { NextMatchCountdown } from './components/NextMatchCountdown'
import { StructureBanner } from './components/StructureBanner'
import { useAppPreferences } from './hooks/useAppPreferences'
import { useAvailableYears } from './hooks/useAvailableYears'
import { useDocumentTitle } from './hooks/useDocumentTitle'
import { useTournamentData } from './hooks/useTournamentData'
import { useViewMode } from './hooks/useViewMode'
import type { ViewMode } from './hooks/useViewMode'
import { clampYear } from './lib/preferences'
import { isFutureWorldCupYear, getMaxSelectableYear } from './lib/worldCupYears'

export default function App() {
  const { t } = useTranslation()
  const {
    prefs,
    edition,
    setYear,
    setLanguage,
    setColorScheme,
    setViewModePref,
    setGroup,
  } = useAppPreferences()

  const { availableYears, loading: yearsLoading } = useAvailableYears()

  useEffect(() => {
    if (isFutureWorldCupYear(prefs.year)) {
      setYear(getMaxSelectableYear())
      return
    }
    if (yearsLoading || availableYears.includes(prefs.year)) return
    const clamped = clampYear(prefs.year, availableYears)
    if (clamped !== prefs.year) setYear(clamped)
  }, [availableYears, prefs.year, setYear, yearsLoading])

  const {
    groups,
    groupsLeft,
    groupsRight,
    knockoutLayout,
    posterBracket,
    groupMatches,
    knockoutMatches,
    standings,
    resolvedKnockout,
    champion,
    lastUpdated,
    loading,
    error,
    dataSource,
    structureWarnings,
  } = useTournamentData(prefs.year, edition)

  useDocumentTitle(prefs.year)

  const { viewMode, setViewMode, showViewToggle } = useViewMode(prefs.viewMode)

  const handleViewModeChange = useCallback(
    (mode: ViewMode) => {
      setViewMode(mode)
      setViewModePref(mode)
    },
    [setViewMode, setViewModePref],
  )

  const allMatches = [...groupMatches, ...knockoutMatches]

  if (loading && groupMatches.length === 0) {
    return (
      <div className="loading-screen">{t('app.loading', { year: prefs.year })}</div>
    )
  }

  return (
    <div className="app-shell">
      <AppToolbar
        prefs={prefs}
        year={prefs.year}
        availableYears={availableYears}
        yearsLoading={yearsLoading}
        showViewToggle={showViewToggle}
        viewMode={viewMode}
        onYearChange={setYear}
        onLanguageChange={setLanguage}
        onColorSchemeChange={setColorScheme}
        onViewModeChange={handleViewModeChange}
      />

      <NextMatchCountdown matches={allMatches} />
      <StructureBanner warnings={structureWarnings} />

      {viewMode === 'poster' ? (
        <BracketPoster
          year={prefs.year}
          hosts={edition.hosts}
          initialGroup={prefs.group}
          highlightMatchNum={prefs.matchNum}
          groupsLeft={groupsLeft}
          groupsRight={groupsRight}
          posterBracket={posterBracket}
          knockoutLayout={knockoutLayout}
          groupMatches={groupMatches}
          standings={standings}
          resolvedKnockout={resolvedKnockout}
          champion={champion}
          lastUpdated={lastUpdated}
          error={error}
          onGroupClose={() => setGroup(null)}
        />
      ) : (
        <MobileListView
          year={prefs.year}
          hosts={edition.hosts}
          groups={groups}
          knockoutLayout={knockoutLayout}
          groupMatches={groupMatches}
          knockoutMatches={knockoutMatches}
          resolvedKnockout={resolvedKnockout}
          champion={champion}
          lastUpdated={lastUpdated}
          error={error}
          highlightMatchNum={prefs.matchNum}
        />
      )}

      <DataAttribution source={dataSource} lastUpdated={lastUpdated} />
    </div>
  )
}
