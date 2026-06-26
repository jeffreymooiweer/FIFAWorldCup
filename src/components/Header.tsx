import { useTranslation } from 'react-i18next'
import { formatLastUpdated } from '../lib/dates'
import { CENTER_SLOTS } from '../lib/bracketLayout'
import { getFlagUrl, getTeamDisplayName } from '../lib/teams'
import type { AppError } from '../types/errors'
import type { ResolvedMatch } from '../types'
import { MatchBox } from './MatchBox'

import { HostFlags } from './HostFlags'
import type { EditionHost } from '../config/editions/types'

interface HeaderProps {
  year: number
  hosts?: EditionHost[]
  lastUpdated: Date | null
  error: AppError | null
}

export function Header({ year, hosts = [], lastUpdated, error }: HeaderProps) {
  const { t } = useTranslation()

  return (
    <header className="header">
      <h1 className="header__title">
        <span className="header__title-wk">{t('header.titleWk')} </span>
        <span className="header__title-year">{year}</span>
      </h1>
      <h2 className="header__subtitle">{t('header.subtitle')}</h2>
      <HostFlags hosts={hosts} />
      {lastUpdated && (
        <p className="header__updated">
          {t('header.lastUpdated', { time: formatLastUpdated(lastUpdated) })}
        </p>
      )}
      {error && (
        <p className="header__error">{t(`errors.${error.key}`, error.params)}</p>
      )}
    </header>
  )
}

interface TrophyCenterProps {
  champion: string | null
  thirdPlace?: ResolvedMatch
  final?: ResolvedMatch
  bracketRows?: number
  compact?: boolean
}

export function TrophyCenter({
  champion,
  thirdPlace,
  final,
  bracketRows = 16,
  compact = false,
}: TrophyCenterProps) {
  const { t } = useTranslation()
  const flag = champion ? getFlagUrl(champion) : null

  const hero = (
    <>
      <img
        className="trophy-center__image"
        src={`${import.meta.env.BASE_URL}wc.png`}
        alt={t('champion.trophyAlt')}
      />
      <div className="trophy-center__champion-box">
        <div className="trophy-center__champion-label">{t('champion.label')}</div>
        {champion ? (
          <div className="trophy-center__champion-team">
            {flag && <img className="match-box__flag" src={flag} alt="" />}
            <span>{getTeamDisplayName(champion)}</span>
          </div>
        ) : (
          <div className="trophy-center__champion-placeholder">{t('champion.unknown')}</div>
        )}
      </div>
    </>
  )

  if (compact) {
    return <div className="trophy-center trophy-center--compact">{hero}</div>
  }

  return (
    <div className="bracket-center">
      <h3 className="bracket-round__title">{t('rounds.finals')}</h3>
      <div
        className="bracket-center__grid"
        style={{ gridTemplateRows: `repeat(${bracketRows}, minmax(0, 1fr))` }}
      >
        <div
          className="bracket-center__hero"
          style={{ gridRow: `${CENTER_SLOTS.hero.row} / span ${CENTER_SLOTS.hero.span}` }}
        >
          {hero}
        </div>

        {final && (
          <div
            className="bracket-slot bracket-center__final"
            style={{ gridRow: `${CENTER_SLOTS.final.row} / span ${CENTER_SLOTS.final.span}` }}
          >
            <div className="bracket-center__match">
              <h4 className="bracket-center__match-title">{t('rounds.final')}</h4>
              <MatchBox match={final} variant="final" showMatchNumber={false} />
            </div>
          </div>
        )}

        {thirdPlace && (
          <div
            className="bracket-slot bracket-center__third"
            style={{
              gridRow: `${CENTER_SLOTS.thirdPlace.row} / span ${CENTER_SLOTS.thirdPlace.span}`,
            }}
          >
            <div className="bracket-center__match">
              <h4 className="bracket-center__match-title">{t('rounds.thirdPlace')}</h4>
              <MatchBox match={thirdPlace} variant="final" showMatchNumber={false} />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
