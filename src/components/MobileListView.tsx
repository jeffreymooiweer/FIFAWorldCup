import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import type { Match, ResolvedMatch } from '../types'
import type { AppError } from '../types/errors'
import type { EditionHost } from '../config/editions/types'
import { getKnockoutListOrder, type KnockoutLayout } from '../lib/knockout'
import { useNow } from '../hooks/useNow'
import { isMatchLive } from '../lib/matchStatus'
import { getTeamDisplayName } from '../lib/teams'
import { GroupColumn } from './GroupColumn'
import { Header, TrophyCenter } from './Header'
import { MatchBox } from './MatchBox'
import { VenueList } from './VenueList'

interface MobileListViewProps {
  year: number
  hosts: EditionHost[]
  groups: string[]
  knockoutLayout: KnockoutLayout
  groupMatches: Match[]
  knockoutMatches: Match[]
  resolvedKnockout: Map<number, ResolvedMatch>
  champion: string | null
  lastUpdated: Date | null
  error: AppError | null
  highlightMatchNum: number | null
}

function LiveGroupMatchSummary({ matches }: { matches: Match[] }) {
  const { t } = useTranslation()
  const now = useNow()
  const liveMatches = matches.filter((m) => isMatchLive(m, now))
  if (liveMatches.length === 0) return null

  return (
    <section className="mobile-live-banner">
      <h3 className="mobile-live-banner__title">{t('live.nowPlaying')}</h3>
      {liveMatches.map((match) => (
        <div key={`${match.date}-${match.team1}-${match.team2}`} className="mobile-live-banner__item">
          <span className="match-box__live-badge">{t('match.live')}</span>
          <span>
            {getTeamDisplayName(match.team1)} {t('match.versus')}{' '}
            {getTeamDisplayName(match.team2)}
          </span>
        </div>
      ))}
    </section>
  )
}

export function MobileListView({
  year,
  hosts,
  groups,
  knockoutLayout,
  groupMatches,
  knockoutMatches,
  resolvedKnockout,
  champion,
  lastUpdated,
  error,
  highlightMatchNum,
}: MobileListViewProps) {
  const { t } = useTranslation()
  const knockoutOrder = getKnockoutListOrder(knockoutLayout)
  const allMatches = [...groupMatches, ...knockoutMatches]

  useEffect(() => {
    if (!highlightMatchNum) return
    const el = document.getElementById(`match-${highlightMatchNum}`)
    el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, [highlightMatchNum, resolvedKnockout])

  return (
    <div className="mobile-list-view">
      <Header year={year} hosts={hosts} lastUpdated={lastUpdated} error={error} />

      <div className="mobile-list-view__champion">
        <TrophyCenter champion={champion} compact />
      </div>

      <LiveGroupMatchSummary matches={groupMatches} />

      <VenueList matches={allMatches} />

      <section className="mobile-list-section">
        <h2 className="mobile-list-section__title">{t('group.phase')}</h2>
        <div className="mobile-list-section__groups">
          {groups.map((group) => (
            <GroupColumn key={group} group={group} groupMatches={groupMatches} />
          ))}
        </div>
      </section>

      {knockoutOrder.map((round) => (
        <section key={round.key} className="mobile-list-section">
          <h2 className="mobile-list-section__title">{t(`rounds.${round.key}`)}</h2>
          <div className="mobile-list-section__matches">
            {round.nums.map((num) => {
              const match = resolvedKnockout.get(num)
              if (!match) return null
              const isFinalRound =
                num === knockoutLayout.final || num === knockoutLayout.thirdPlace
              return (
                <MatchBox
                  key={num}
                  match={match}
                  variant={isFinalRound ? 'final' : 'knockout'}
                />
              )
            })}
          </div>
        </section>
      ))}
    </div>
  )
}
