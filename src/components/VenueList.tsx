import { useTranslation } from 'react-i18next'
import type { Match } from '../types'
import { formatVenueDisplay } from '../lib/venues'

interface VenueListProps {
  matches: Match[]
}

export function VenueList({ matches }: VenueListProps) {
  const { t } = useTranslation()
  const venues = [...new Set(matches.map((m) => m.ground).filter(Boolean))] as string[]

  if (venues.length === 0) return null

  return (
    <section className="venue-list" aria-label={t('venues.title')}>
      <h3 className="venue-list__title">{t('venues.title')}</h3>
      <ul className="venue-list__items">
        {venues.sort().map((venue) => (
          <li key={venue}>{formatVenueDisplay(venue)}</li>
        ))}
      </ul>
    </section>
  )
}
