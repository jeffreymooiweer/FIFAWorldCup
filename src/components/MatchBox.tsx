import { forwardRef } from 'react'
import { useTranslation } from 'react-i18next'
import type { Match, ResolvedMatch } from '../types'
import { useNow } from '../hooks/useNow'
import { formatMatchDateTime } from '../lib/dates'
import { isMatchLive } from '../lib/matchStatus'
import { matchInvolvesNetherlands } from '../lib/matchUtils'
import { getFlagUrl, getTeamDisplayName } from '../lib/teams'
import { formatVenueDisplay } from '../lib/venues'

interface MatchBoxProps {
  match: Match | ResolvedMatch
  variant?: 'group' | 'knockout' | 'final'
  showMatchNumber?: boolean
  compact?: boolean
}

function isResolved(match: Match | ResolvedMatch): match is ResolvedMatch {
  return 'resolvedTeam1' in match
}

function TeamRow({
  team,
  score,
  isWinner,
  isPlaceholder,
}: {
  team: string
  score: number | null
  isWinner: boolean
  isPlaceholder: boolean
}) {
  const flagUrl = !isPlaceholder ? getFlagUrl(team) : null
  const displayName = isPlaceholder ? team : getTeamDisplayName(team)

  return (
    <div
      className={[
        'match-box__team',
        isWinner ? 'match-box__team--winner' : '',
        isPlaceholder ? 'match-box__team--placeholder' : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {flagUrl ? (
        <img className="match-box__flag" src={flagUrl} alt="" loading="lazy" />
      ) : (
        <span className="match-box__flag match-box__flag--empty" />
      )}
      <span className="match-box__name">{displayName}</span>
      {score !== null && <span className="match-box__score">{score}</span>}
    </div>
  )
}

export const MatchBox = forwardRef<HTMLDivElement, MatchBoxProps>(function MatchBox(
  {
    match,
    variant = 'knockout',
    showMatchNumber = true,
    compact = false,
  },
  ref,
) {
  const { t } = useTranslation()
  const now = useNow()
  const live = isMatchLive(match, now)
  const oranje = matchInvolvesNetherlands(match)
  const resolved = isResolved(match)
  const team1 = resolved ? match.resolvedTeam1 : match.team1
  const team2 = resolved ? match.resolvedTeam2 : match.team2
  const placeholder1 = resolved ? match.isPlaceholder1 : false
  const placeholder2 = resolved ? match.isPlaceholder2 : false
  const score1 = match.score?.[0] ?? null
  const score2 = match.score?.[1] ?? null
  const winner = resolved ? match.winner : null

  return (
    <div
      ref={ref}
      id={match.num ? `match-${match.num}` : undefined}
      className={[
        'match-box',
        variant === 'knockout' ? 'match-box--knockout' : '',
        variant === 'final' ? 'match-box--final' : '',
        compact ? 'match-box--compact' : '',
        live ? 'match-box--live' : '',
        oranje ? 'match-box--oranje' : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {oranje && <span className="match-box__oranje-badge">{t('netherlands.badge')}</span>}
      {live && <span className="match-box__live-badge">{t('match.live')}</span>}
      {showMatchNumber && match.num && (
        <div className="match-box__header">{t('match.number', { num: match.num })}</div>
      )}
      <div className="match-box__datetime">
        {formatMatchDateTime(match.date, match.time)}
      </div>
      {match.ground && variant !== 'group' && (
        <div className="match-box__venue">{formatVenueDisplay(match.ground)}</div>
      )}
      <TeamRow
        team={team1}
        score={match.played ? score1 : null}
        isWinner={winner === team1}
        isPlaceholder={placeholder1}
      />
      <TeamRow
        team={team2}
        score={match.played ? score2 : null}
        isWinner={winner === team2}
        isPlaceholder={placeholder2}
      />
    </div>
  )
})
