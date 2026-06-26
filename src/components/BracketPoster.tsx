import { useCallback, useEffect, useState } from 'react'
import type { GroupStanding, Match, ResolvedMatch } from '../types'
import type { AppError } from '../types/errors'
import type { EditionHost } from '../config/editions/types'
import type { KnockoutLayout } from '../lib/knockout'
import type { PosterBracketConfig } from '../config/posterBracket'
import { useFitPoster } from '../hooks/useFitPoster'
import { BracketHalf } from './BracketHalf'
import { GroupColumn } from './GroupColumn'
import { GroupStandingsPanel } from './GroupStandingsPanel'
import { Header, TrophyCenter } from './Header'
import { ZoomControls } from './ZoomControls'

interface BracketPosterProps {
  year: number
  hosts: EditionHost[]
  initialGroup: string | null
  highlightMatchNum: number | null
  groupsLeft: string[]
  groupsRight: string[]
  posterBracket: PosterBracketConfig
  knockoutLayout: KnockoutLayout
  groupMatches: Match[]
  standings: GroupStanding[]
  resolvedKnockout: Map<number, ResolvedMatch>
  champion: string | null
  lastUpdated: Date | null
  error: AppError | null
  onGroupClose: () => void
}

export function BracketPoster({
  year,
  hosts,
  initialGroup,
  highlightMatchNum,
  groupsLeft,
  groupsRight,
  posterBracket,
  knockoutLayout,
  groupMatches,
  standings,
  resolvedKnockout,
  champion,
  lastUpdated,
  error,
  onGroupClose,
}: BracketPosterProps) {
  const [selectedGroup, setSelectedGroup] = useState<string | null>(initialGroup)
  const {
    posterRef,
    scale,
    scaledWidth,
    scaledHeight,
    zoomIn,
    zoomOut,
    resetZoom,
  } = useFitPoster()
  const thirdPlace = knockoutLayout.thirdPlace
    ? resolvedKnockout.get(knockoutLayout.thirdPlace)
    : undefined
  const final = knockoutLayout.final
    ? resolvedKnockout.get(knockoutLayout.final)
    : undefined

  useEffect(() => {
    if (initialGroup) setSelectedGroup(initialGroup)
  }, [initialGroup])

  useEffect(() => {
    if (!highlightMatchNum) return
    const el = document.getElementById(`match-${highlightMatchNum}`)
    el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, [highlightMatchNum, resolvedKnockout])

  const handleGroupSelect = useCallback((group: string) => {
    setSelectedGroup(group)
  }, [])

  const handleCloseStandings = useCallback(() => {
    setSelectedGroup(null)
    onGroupClose()
  }, [onGroupClose])

  const groupCount = groupsLeft.length + groupsRight.length

  return (
    <div className="poster-viewport">
      <ZoomControls
        onZoomIn={zoomIn}
        onZoomOut={zoomOut}
        onReset={resetZoom}
        scale={scale}
      />

      {selectedGroup && (
        <GroupStandingsPanel
          group={selectedGroup}
          standings={standings}
          onClose={handleCloseStandings}
        />
      )}

      <div
        className="poster-scale-wrap"
        style={
          scaledWidth > 0
            ? { width: scaledWidth, height: scaledHeight }
            : undefined
        }
      >
        <div
          ref={posterRef}
          className="poster"
          style={{
            ...(scale !== 1
              ? {
                  transform: `scale(${scale})`,
                  transformOrigin: 'top left',
                }
              : {}),
            ['--group-count' as string]: groupCount,
          }}
        >
          <Header year={year} hosts={hosts} lastUpdated={lastUpdated} error={error} />

          <div className="poster__body">
            <div className="poster__groups-left">
              {groupsLeft.map((group) => (
                <GroupColumn
                  key={group}
                  group={group}
                  groupMatches={groupMatches}
                  clickable
                  onSelect={handleGroupSelect}
                />
              ))}
            </div>

            <BracketHalf
              config={posterBracket.left}
              resolvedKnockout={resolvedKnockout}
              bracketRows={posterBracket.rows}
            />

            <div className="poster__center">
              <TrophyCenter
                champion={champion}
                thirdPlace={thirdPlace}
                final={final}
                bracketRows={posterBracket.rows}
              />
            </div>

            <BracketHalf
              config={posterBracket.right}
              resolvedKnockout={resolvedKnockout}
              bracketRows={posterBracket.rows}
            />

            <div className="poster__groups-right">
              {groupsRight.map((group) => (
                <GroupColumn
                  key={group}
                  group={group}
                  groupMatches={groupMatches}
                  clickable
                  onSelect={handleGroupSelect}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
