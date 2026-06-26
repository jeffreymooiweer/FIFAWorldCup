import { useTranslation } from 'react-i18next'
import type { DataSource } from '../lib/dataFetch'
import { formatLastUpdated } from '../lib/dates'

interface DataAttributionProps {
  source: DataSource | null
  lastUpdated: Date | null
}

export function DataAttribution({ source, lastUpdated }: DataAttributionProps) {
  const { t } = useTranslation()

  const sourceLabel =
    source === 'live'
      ? t('meta.sourceLive')
      : source === 'cache'
        ? t('meta.sourceCache')
        : source === 'bundled'
          ? t('meta.sourceBundled')
          : null

  if (!sourceLabel) return null

  return (
    <footer className="data-attribution">
      <span>{sourceLabel}</span>
      {lastUpdated && (
        <span className="data-attribution__time">
          · {formatLastUpdated(lastUpdated)}
        </span>
      )}
    </footer>
  )
}
