import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import type { ViewMode } from '../hooks/useViewMode'
import { ViewToggle } from './ViewToggle'

interface AppDockProps {
  year: number
  availableYears: number[]
  viewMode: ViewMode
  onYearChange: (year: number) => void
  onViewModeChange: (mode: ViewMode) => void
}

export function AppDock({
  year,
  availableYears,
  viewMode,
  onYearChange,
  onViewModeChange,
}: AppDockProps) {
  const { t } = useTranslation()

  const yearIndex = availableYears.indexOf(year)
  const canGoNewer = yearIndex > 0 || (yearIndex === -1 && availableYears.length > 0)
  const canGoOlder =
    (yearIndex >= 0 && yearIndex < availableYears.length - 1) ||
    (yearIndex === -1 && availableYears.length > 0)

  const goNewer = useCallback(() => {
    if (availableYears.length === 0) return
    if (yearIndex > 0) {
      onYearChange(availableYears[yearIndex - 1])
      return
    }
    if (yearIndex === -1) onYearChange(availableYears[0])
  }, [availableYears, onYearChange, yearIndex])

  const goOlder = useCallback(() => {
    if (availableYears.length === 0) return
    if (yearIndex >= 0 && yearIndex < availableYears.length - 1) {
      onYearChange(availableYears[yearIndex + 1])
      return
    }
    if (yearIndex === -1) onYearChange(availableYears[availableYears.length - 1])
  }, [availableYears, onYearChange, yearIndex])

  return (
    <div className="app-dock" role="toolbar" aria-label={t('dock.ariaLabel')}>
      <div className="app-dock__year" aria-label={t('settings.year')}>
        <button
          type="button"
          className="app-dock__year-btn"
          onClick={goNewer}
          disabled={!canGoNewer}
          aria-label={t('dock.newerYear')}
        >
          ‹
        </button>
        <span className="app-dock__year-value">{year}</span>
        <button
          type="button"
          className="app-dock__year-btn"
          onClick={goOlder}
          disabled={!canGoOlder}
          aria-label={t('dock.olderYear')}
        >
          ›
        </button>
      </div>

      <ViewToggle viewMode={viewMode} onChange={onViewModeChange} />
    </div>
  )
}
