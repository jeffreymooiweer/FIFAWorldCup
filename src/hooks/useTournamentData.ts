import { useCallback, useEffect, useMemo, useState } from 'react'
import { parseTournament, splitMatches } from '../lib/parseTournament'
import type { EditionConfig } from '../config/editions/types'
import { getPosterBracket } from '../config/posterBracket'
import type { PosterBracketConfig } from '../config/posterBracket'
import { deriveGroupsFromMatches, splitGroupsForPoster } from '../lib/groups'
import { resolveKnockoutBracket, getChampion } from '../lib/bracket'
import { fetchWorldCupDataWithFallback, type DataProvider } from '../lib/dataFetch'
import { inferKnockoutLayout, type KnockoutLayout } from '../lib/knockout'
import { calculateStandings } from '../lib/standings'
import { validateTournamentStructure } from '../lib/validateStructure'
import type { Match, ResolvedMatch, GroupStanding } from '../types'
import type { AppError } from '../types/errors'
import { TournamentLoadError, isTournamentLoadError } from '../types/errors'

const POLL_INTERVAL_MS = 2 * 60 * 1000

const EMPTY_LAYOUT = inferKnockoutLayout([])

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
  dataSource: DataProvider | null
  dataProviders: DataProvider[]
  structureWarnings: string[]
}

export function useTournamentData(year: number, edition: EditionConfig): UseTournamentResult {
  const [groupMatches, setGroupMatches] = useState<Match[]>([])
  const [knockoutMatches, setKnockoutMatches] = useState<Match[]>([])
  const [standings, setStandings] = useState<GroupStanding[]>([])
  const [resolvedKnockout, setResolvedKnockout] = useState<Map<number, ResolvedMatch>>(
    new Map(),
  )
  const [knockoutLayout, setKnockoutLayout] = useState<KnockoutLayout>(EMPTY_LAYOUT)
  const [champion, setChampion] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<AppError | null>(null)
  const [dataSource, setDataSource] = useState<DataProvider | null>(null)
  const [dataProviders, setDataProviders] = useState<DataProvider[]>([])
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

  const loadData = useCallback(async (signal: { cancelled: boolean }) => {
    try {
      const result = await fetchWorldCupDataWithFallback(year)
      if (signal.cancelled) return

      const matches = parseTournament(result.data)
      const { groupMatches: groups, knockoutMatches: knockouts } = splitMatches(matches)
      if (groups.length === 0) {
        throw new TournamentLoadError('loadFailed', { status: 'empty' })
      }

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
      setDataProviders(result.providers)
      setStructureWarnings(validateTournamentStructure(result.data))
      setError(null)
    } catch (err) {
      if (signal.cancelled) return
      if (isTournamentLoadError(err)) {
        setError({ key: err.key, params: err.params })
      } else {
        setError({ key: 'unknown' })
      }
      setGroupMatches([])
      setKnockoutMatches([])
      setKnockoutLayout(EMPTY_LAYOUT)
      setStandings([])
      setResolvedKnockout(new Map())
      setChampion(null)
    } finally {
      if (!signal.cancelled) setLoading(false)
    }
  }, [year])

  useEffect(() => {
    const signal = { cancelled: false }
    setLoading(true)
    setError(null)
    setGroupMatches([])
    setKnockoutMatches([])
    setKnockoutLayout(EMPTY_LAYOUT)
    setStandings([])
    setResolvedKnockout(new Map())
    setChampion(null)

    void loadData(signal)
    const interval = window.setInterval(() => {
      void loadData(signal)
    }, POLL_INTERVAL_MS)

    const onVisible = () => {
      if (document.visibilityState === 'visible') void loadData(signal)
    }
    document.addEventListener('visibilitychange', onVisible)

    return () => {
      signal.cancelled = true
      window.clearInterval(interval)
      document.removeEventListener('visibilitychange', onVisible)
    }
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
    dataProviders,
    structureWarnings,
  }
}
