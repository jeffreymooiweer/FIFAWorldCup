import { useTranslation } from 'react-i18next'
import type { GroupStanding } from '../types'
import { getGroupTable } from '../lib/standings'
import { getFlagUrl, getTeamDisplayName } from '../lib/teams'

interface GroupStandingsPanelProps {
  group: string
  standings: GroupStanding[]
  onClose: () => void
}

function formatGoalDiff(diff: number): string {
  if (diff > 0) return `+${diff}`
  return String(diff)
}

export function GroupStandingsPanel({ group, standings, onClose }: GroupStandingsPanelProps) {
  const { t } = useTranslation()
  const rows = getGroupTable(standings, group)

  return (
    <div className="standings-overlay" onClick={onClose} role="presentation">
      <article
        className="standings-card"
        onClick={(e) => e.stopPropagation()}
        aria-labelledby="standings-title"
      >
        <header className="standings-card__header">
          <div className="standings-card__titles">
            <h2 id="standings-title" className="standings-card__title">
              {t('standings.title')}
            </h2>
            <p className="standings-card__subtitle">{t('standings.subtitle')}</p>
            <p className="standings-card__group">{t('standings.group', { group })}</p>
          </div>
          <button
            type="button"
            className="standings-card__close"
            onClick={onClose}
            aria-label={t('standings.backToPoster')}
          >
            ›
          </button>
        </header>

        <div className="standings-table-wrap">
          <table className="standings-table">
            <thead>
              <tr>
                <th className="standings-table__col-rank" aria-label={t('standings.position')} />
                <th className="standings-table__col-team">{t('standings.team')}</th>
                <th>{t('standings.played')}</th>
                <th>{t('standings.won')}</th>
                <th>{t('standings.drawn')}</th>
                <th>{t('standings.lost')}</th>
                <th>{t('standings.goalDiff')}</th>
                <th className="standings-table__col-points">{t('standings.points')}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const flag = getFlagUrl(row.team)
                return (
                  <tr key={row.team}>
                    <td className="standings-table__col-rank">{row.position}</td>
                    <td className="standings-table__col-team">
                      <span className="standings-table__team">
                        {flag && (
                          <img className="standings-table__flag" src={flag} alt="" />
                        )}
                        <span>{getTeamDisplayName(row.team)}</span>
                      </span>
                    </td>
                    <td>{row.played}</td>
                    <td>{row.won}</td>
                    <td>{row.drawn}</td>
                    <td>{row.lost}</td>
                    <td>{formatGoalDiff(row.goalDiff)}</td>
                    <td className="standings-table__col-points">{row.points}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </article>
    </div>
  )
}
