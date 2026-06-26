import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import type { ViewMode } from '../hooks/useViewMode'
import { ViewToggle } from './ViewToggle'

interface AppDockProps {
  year: number
  availableYears: number[]
  yearsLoading?: boolean
  viewMode: ViewMode
  onYearChange: (year: number) => void
  onViewModeChange: (mode: ViewMode) => void
}

export function AppDock({
  year,
  availableYears,
  yearsLoading = false,
  viewMode,
  onYearChange,
  onViewModeChange,
}: AppDockProps) {
  const { t } = useTranslation()

  const yearIndex = availableYears.indexOf(year)
  const canGoNewer = yearIndex > 0
  const canGoOlder = yearIndex >= 0 && yearIndex < availableYears.length - 1

  const goNewer = useCallback(() => {
    if (!canGoNewer) return
    onYearChange(availableYears[yearIndex - 1])
  }, [availableYears, canGoNewer, onYearChange, yearIndex])

  const goOlder = useCallback(() => {
    if (!canGoOlder) return
    onYearChange(availableYears[yearIndex + 1])
  }, [availableYears, canGoOlder, onYearChange, yearIndex])

  return (
    <div className="app-dock" role="toolbar" aria-label={t('dock.ariaLabel')}>
      <div className="app-dock__year" aria-label={t('settings.year')}>
        <button
          type="button"
          className="app-dock__year-btn"
          onClick={goNewer}
          disabled={yearsLoading || !canGoNewer}
          aria-label={t('dock.newerYear')}
        >
          ‹
        </button>
        <span className="app-dock__year-value">{year}</span>
        <button
          type="button"
          className="app-dock__year-btn"
          onClick={goOlder}
          disabled={yearsLoading || !canGoOlder}
          aria-label={t('dock.olderYear')}
        >
          ›
        </button>
      </div>

      <ViewToggle viewMode={viewMode} onChange={onViewModeChange} />
    </div>
  )
}
