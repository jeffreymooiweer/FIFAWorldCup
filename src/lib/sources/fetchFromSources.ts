import { parseTournament, splitMatches } from '../parseTournament'
import { TournamentLoadError } from '../../types/errors'
import type { WorldCupData } from '../../types'
import { PROVIDER_PRIORITY, isProviderEnabled } from './config'
import { mergeWorldCupData, sortByProviderPriority } from './normalize'
import { openfootballSource } from './openfootball'
import { fjelstulSource } from './fjelstul'
import { worldcup26Source } from './worldcup26'
import { footballDataOrgSource } from './footballDataOrg'
import { apiFootballSource } from './apiFootball'
import { zafronixSource } from './zafronix'
import { bundledSource } from './bundled'
import type { DataProvider, MergedFetchResult, SourceFetchResult, WorldCupSource } from './types'

const ALL_SOURCES: WorldCupSource[] = [
  openfootballSource,
  worldcup26Source,
  apiFootballSource,
  footballDataOrgSource,
  zafronixSource,
  fjelstulSource,
  bundledSource,
]

function isValidData(data: WorldCupData): boolean {
  try {
    const { groupMatches } = splitMatches(parseTournament(data))
    return groupMatches.length > 0
  } catch {
    return false
  }
}

function sourcesForYear(year: number): WorldCupSource[] {
  return ALL_SOURCES.filter(
    (source) => isProviderEnabled(source.id) && source.isAvailable(year),
  )
}

export async function fetchWorldCupFromSources(year: number): Promise<MergedFetchResult> {
  const sources = sourcesForYear(year)
  const results = await Promise.all(
    sources.map(async (source): Promise<SourceFetchResult | null> => {
      try {
        const data = await source.fetch(year)
        if (!data || !isValidData(data)) return null
        return { data, provider: source.id }
      } catch {
        return null
      }
    }),
  )

  const successes = sortByProviderPriority(
    results.filter((r): r is SourceFetchResult => r !== null),
    PROVIDER_PRIORITY,
  )

  if (successes.length === 0) {
    throw new TournamentLoadError('loadFailed', { status: 'no-sources' })
  }

  let merged = successes[0].data
  for (let i = 1; i < successes.length; i += 1) {
    try {
      merged = mergeWorldCupData(merged, successes[i].data)
    } catch {
      // Ignore secondary sources that cannot be merged safely.
    }
  }

  if (!isValidData(merged)) {
    throw new TournamentLoadError('loadFailed', { status: 'invalid-merge' })
  }

  return {
    data: merged,
    provider: successes[0].provider,
    providers: successes.map((s) => s.provider),
    fromCache: false,
    fetchedAt: new Date(),
  }
}

export async function probeYearFromSources(year: number): Promise<boolean> {
  const sources = sourcesForYear(year)
  for (const source of sources) {
    try {
      const data = await source.fetch(year)
      if (data && isValidData(data)) return true
    } catch {
      // try next
    }
  }
  return false
}

export function listConfiguredProviders(): DataProvider[] {
  return PROVIDER_PRIORITY.filter(isProviderEnabled)
}

export { ALL_SOURCES }
