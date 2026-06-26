import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { Match } from '../types'
import { useNow } from '../hooks/useNow'
import { findNextMatch, getCountdownParts } from '../lib/matchUtils'
import { parseMatchDateTime } from '../lib/dates'
import { getTeamDisplayName } from '../lib/teams'

interface NextMatchCountdownProps {
  matches: Match[]
}

export function NextMatchCountdown({ matches }: NextMatchCountdownProps) {
  const { t } = useTranslation()
  const now = useNow()
  const next = findNextMatch(matches, now)

  const [parts, setParts] = useState(() =>
    next ? getCountdownParts(parseMatchDateTime(next.date, next.time), now) : null,
  )

  useEffect(() => {
    if (!next) {
      setParts(null)
      return
    }
    const target = parseMatchDateTime(next.date, next.time)
    const tick = () => setParts(getCountdownParts(target, new Date()))
    tick()
    const id = window.setInterval(tick, 1000)
    return () => window.clearInterval(id)
  }, [next, now])

  if (!next || !parts) return null

  const label =
    parts.totalSeconds < 3600
      ? t('countdown.soon')
      : t('countdown.days', {
          days: parts.days,
          hours: parts.hours,
          minutes: parts.minutes,
        })

  return (
    <div className="countdown-banner" role="status">
      <span className="countdown-banner__label">{t('countdown.label')}</span>
      <span className="countdown-banner__match">
        {getTeamDisplayName(next.team1)} vs {getTeamDisplayName(next.team2)}
      </span>
      <span className="countdown-banner__time">{label}</span>
    </div>
  )
}
