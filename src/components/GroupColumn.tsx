import { useTranslation } from 'react-i18next'
import type { Match } from '../types'
import { getGroupMatchesForGroup } from '../lib/bracket'
import { formatShortDate } from '../lib/dates'
import { useNow } from '../hooks/useNow'
import { isMatchLive } from '../lib/matchStatus'
import { getFlagUrl, getTeamDisplayName } from '../lib/teams'

interface GroupColumnProps {
  group: string
  groupMatches: Match[]
  onSelect?: (group: string) => void
  clickable?: boolean
}

function GroupMatchRow({ match }: { match: Match }) {
  const { t } = useTranslation()
  const now = useNow()
  const live = isMatchLive(match, now)
  const winner =
    match.played && match.score
      ? match.score[0] > match.score[1]
        ? match.team1
        : match.score[1] > match.score[0]
          ? match.team2
          : null
      : null

  const renderTeam = (team: string) => {
    const flag = getFlagUrl(team)
    const isWinner = winner === team
    return (
      <span
        className={[
          'group-match-row__team',
          isWinner ? 'group-match-row__team--winner' : '',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        {flag && <img className="match-box__flag" src={flag} alt="" loading="lazy" />}
        {getTeamDisplayName(team)}
      </span>
    )
  }

  return (
    <div className={`group-match-row${live ? ' group-match-row--live' : ''}`}>
      <span className="group-match-row__date">
        {live ? (
          <span className="match-box__live-badge match-box__live-badge--small">
            {t('match.live')}
          </span>
        ) : (
          formatShortDate(match.date)
        )}
      </span>
      {renderTeam(match.team1)}
      <span className="group-match-row__vs">
        {match.played && match.score ? `${match.score[0]}-${match.score[1]}` : '-'}
      </span>
      {renderTeam(match.team2)}
    </div>
  )
}

export function GroupColumn({
  group,
  groupMatches,
  onSelect,
  clickable = false,
}: GroupColumnProps) {
  const { t } = useTranslation()
  const matches = getGroupMatchesForGroup(groupMatches, group)

  return (
    <section
      className={`group-column${clickable ? ' group-column--clickable' : ''}`}
      onClick={clickable && onSelect ? () => onSelect(group) : undefined}
      onKeyDown={
        clickable && onSelect
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onSelect(group)
              }
            }
          : undefined
      }
      role={clickable ? 'button' : undefined}
      tabIndex={clickable ? 0 : undefined}
      aria-label={clickable ? t('group.viewStandings', { group }) : undefined}
    >
      <h3 className="group-column__title">{t('group.title', { group })}</h3>
      <p className="group-column__label">{t('group.phase')}</p>
      <div className="group-column__matches">
        {matches.map((match) => (
          <GroupMatchRow key={`${match.date}-${match.team1}-${match.team2}`} match={match} />
        ))}
      </div>
    </section>
  )
}
