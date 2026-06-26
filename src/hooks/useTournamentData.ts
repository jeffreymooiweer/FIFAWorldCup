import { useCallback, useEffect, useMemo, useState } from 'react'
import { parseTournament, splitMatches } from '../lib/parseTournament'
import type { EditionConfig } from '../config/editions/types'
import { getPosterBracket } from '../config/posterBracket'
import type { PosterBracketConfig } from '../config/posterBracket'
import { deriveGroupsFromMatches, splitGroupsForPoster } from '../lib/groups'
import { resolveKnockoutBracket, getChampion } from '../lib/bracket'
import { fetchWorldCupDataWithFallback, type DataSource } from '../lib/dataFetch'
import { inferKnockoutLayout, type KnockoutLayout } from '../lib/knockout'
import { calculateStandings } from '../lib/standings'
import { validateTournamentStructure } from '../lib/validateStructure'
import type { Match, ResolvedMatch, GroupStanding } from '../types'
import type { AppError } from '../types/errors'
import { TournamentLoadError } from '../types/errors'

const POLL_INTERVAL_MS = 5 * 60 * 1000

export interface UseTournamentResult {
  groups: string[]
  groupsLeft: string[]
  groupsRight: string[]
  knockoutLayout: KnockoutLayout
  posterBracket: PosterBracketConfig
  groupMatches: Match[]
  knockoutMatches: Match[]
  standings: GroupStanding[]
  resolvedKnockout: Map<number, ResolvedMatch>
  champion: string | null
  lastUpdated: Date | null
  loading: boolean
  error: AppError | null
  dataSource: DataSource | null
  structureWarnings: string[]
}

export function useTournamentData(year: number, edition: EditionConfig): UseTournamentResult {
  const [groupMatches, setGroupMatches] = useState<Match[]>([])
  const [knockoutMatches, setKnockoutMatches] = useState<Match[]>([])
  const [standings, setStandings] = useState<GroupStanding[]>([])
  const [resolvedKnockout, setResolvedKnockout] = useState<Map<number, ResolvedMatch>>(
    new Map(),
  )
  const [knockoutLayout, setKnockoutLayout] = useState<KnockoutLayout>(() =>
    inferKnockoutLayout([]),
  )
  const [champion, setChampion] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<AppError | null>(null)
  const [dataSource, setDataSource] = useState<DataSource | null>(null)
  const [structureWarnings, setStructureWarnings] = useState<string[]>([])

  const groups = useMemo(() => deriveGroupsFromMatches(groupMatches), [groupMatches])
  const { left: groupsLeft, right: groupsRight } = useMemo(
    () => splitGroupsForPoster(groups),
    [groups],
  )
  const posterBracket = useMemo(
    () => getPosterBracket(edition, knockoutLayout),
    [edition, knockoutLayout],
  )

  const loadData = useCallback(async () => {
    try {
      const result = await fetchWorldCupDataWithFallback(year)
      const matches = parseTournament(result.data)
      const { groupMatches: groups, knockoutMatches: knockouts } = splitMatches(matches)
      const layout = inferKnockoutLayout(knockouts)
      const computedStandings = calculateStandings(groups)
      const resolved = resolveKnockoutBracket(knockouts, computedStandings)

      setGroupMatches(groups)
      setKnockoutMatches(knockouts)
      setKnockoutLayout(layout)
      setStandings(computedStandings)
      setResolvedKnockout(resolved)
      setChampion(getChampion(resolved, layout.final))
      setLastUpdated(result.fetchedAt)
      setDataSource(result.source)
      setStructureWarnings(validateTournamentStructure(result.data))
      setError(null)
    } catch (err) {
      if (err instanceof TournamentLoadError) {
        setError({ key: err.key, params: err.params })
      } else {
        setError({ key: 'unknown' })
      }
    } finally {
      setLoading(false)
    }
  }, [year])

  useEffect(() => {
    setLoading(true)
    void loadData()
    const interval = window.setInterval(() => {
      void loadData()
    }, POLL_INTERVAL_MS)
    return () => window.clearInterval(interval)
  }, [loadData])

  return {
    groups,
    groupsLeft,
    groupsRight,
    knockoutLayout,
    posterBracket,
    groupMatches,
    knockoutMatches,
    standings,
    resolvedKnockout,
    champion,
    lastUpdated,
    loading,
    error,
    dataSource,
    structureWarnings,
  }
}
