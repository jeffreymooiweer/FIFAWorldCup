import { useTranslation } from 'react-i18next'
import type { DataProvider } from '../lib/dataFetch'
import { formatLastUpdated } from '../lib/dates'

interface DataAttributionProps {
  source: DataProvider | null
  providers?: DataProvider[]
  lastUpdated: Date | null
}

const PROVIDER_KEYS: Record<DataProvider, string> = {
  openfootball: 'meta.sourceOpenfootball',
  fjelstul: 'meta.sourceFjelstul',
  worldcup26: 'meta.sourceWorldcup26',
  'football-data': 'meta.sourceFootballData',
  'api-football': 'meta.sourceApiFootball',
  zafronix: 'meta.sourceZafronix',
  bundled: 'meta.sourceBundled',
  cache: 'meta.sourceCache',
}

export function DataAttribution({ source, providers = [], lastUpdated }: DataAttributionProps) {
  const { t } = useTranslation()

  if (!source) return null

  const label =
    source === 'cache'
      ? t('meta.sourceCache')
      : t('meta.sourceMerged', {
          primary: t(PROVIDER_KEYS[source]),
          count: Math.max(providers.length, 1),
        })

  return (
    <footer className="data-attribution">
      <span>{label}</span>
      {lastUpdated && (
        <span className="data-attribution__time">
          · {formatLastUpdated(lastUpdated)}
        </span>
      )}
    </footer>
  )
}
