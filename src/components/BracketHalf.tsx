import type { BracketHalfConfig } from '../lib/bracketLayout'
import type { ResolvedMatch } from '../types'
import { useTranslation } from 'react-i18next'
import { MatchBox } from './MatchBox'

interface BracketHalfProps {
  config: BracketHalfConfig
  resolvedKnockout: Map<number, ResolvedMatch>
  bracketRows: number
}

export function BracketHalf({ config, resolvedKnockout, bracketRows }: BracketHalfProps) {
  const { t } = useTranslation()

  return (
    <div className={`bracket-half bracket-half--${config.side}`}>
      {config.rounds.map((round) => (
        <section
          key={round.key}
          className="bracket-round"
          style={{ gridColumn: round.column }}
        >
          <h3 className="bracket-round__title">{t(`rounds.${round.key}`)}</h3>
          <div
            className="bracket-round__grid"
            style={{ gridTemplateRows: `repeat(${bracketRows}, minmax(0, 1fr))` }}
          >
            {round.slots.map((slot) => {
              const match = resolvedKnockout.get(slot.matchNum)
              if (!match) return null
              return (
                <div
                  key={slot.matchNum}
                  className="bracket-slot"
                  style={{
                    gridRow: `${slot.row} / span ${slot.span}`,
                  }}
                >
                  <MatchBox
                    match={match}
                    variant="knockout"
                    compact={round.key === 'r32'}
                  />
                </div>
              )
            })}
          </div>
        </section>
      ))}
    </div>
  )
}
