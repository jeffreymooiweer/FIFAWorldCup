import { useTranslation } from 'react-i18next'
import type { ViewMode } from '../hooks/useViewMode'

interface ViewToggleProps {
  viewMode: ViewMode
  onChange: (mode: ViewMode) => void
}

export function ViewToggle({ viewMode, onChange }: ViewToggleProps) {
  const { t } = useTranslation()

  return (
    <div className="view-toggle" role="tablist" aria-label={t('view.ariaLabel')}>
      <button
        type="button"
        role="tab"
        aria-selected={viewMode === 'list'}
        className={`view-toggle__btn${viewMode === 'list' ? ' view-toggle__btn--active' : ''}`}
        onClick={() => onChange('list')}
      >
        {t('view.list')}
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={viewMode === 'poster'}
        className={`view-toggle__btn${viewMode === 'poster' ? ' view-toggle__btn--active' : ''}`}
        onClick={() => onChange('poster')}
      >
        {t('view.poster')}
      </button>
    </div>
  )
}
