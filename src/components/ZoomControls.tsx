import { useTranslation } from 'react-i18next'

interface ZoomControlsProps {
  className?: string
  onZoomIn: () => void
  onZoomOut: () => void
  onReset: () => void
  scale: number
}

export function ZoomControls({
  className,
  onZoomIn,
  onZoomOut,
  onReset,
  scale,
}: ZoomControlsProps) {
  const { t } = useTranslation()

  return (
    <div
      className={['zoom-controls', className].filter(Boolean).join(' ')}
      role="toolbar"
      aria-label={t('zoom.ariaLabel')}
    >
      <button
        type="button"
        className="zoom-controls__btn"
        onClick={onZoomOut}
        aria-label={t('zoom.zoomOut')}
      >
        −
      </button>
      <button
        type="button"
        className="zoom-controls__btn zoom-controls__btn--fit"
        onClick={onReset}
        aria-label={t('zoom.fitAria')}
      >
        {t('zoom.fit')}
      </button>
      <span className="zoom-controls__label">{Math.round(scale * 100)}%</span>
      <button
        type="button"
        className="zoom-controls__btn"
        onClick={onZoomIn}
        aria-label={t('zoom.zoomIn')}
      >
        +
      </button>
    </div>
  )
}
