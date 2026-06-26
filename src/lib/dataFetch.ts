import type { WorldCupData } from '../types'
import { TournamentLoadError } from '../types/errors'
import { fetchWorldCupFromSources } from './sources/fetchFromSources'
import type { DataProvider, MergedFetchResult } from './sources/types'

export type { DataProvider }

const CACHE_PREFIX = 'wk-data-cache-'

function cacheKey(year: number): string {
  return `${CACHE_PREFIX}${year}`
}

function readCache(year: number): WorldCupData | null {
  try {
    const raw = localStorage.getItem(cacheKey(year))
    if (!raw) return null
    return JSON.parse(raw) as WorldCupData
  } catch {
    return null
  }
}

function writeCache(year: number, data: WorldCupData): void {
  try {
    localStorage.setItem(cacheKey(year), JSON.stringify(data))
  } catch {
    // storage full — ignore
  }
}

export interface FetchResult extends MergedFetchResult {
  source: DataProvider
}

export async function fetchWorldCupDataWithFallback(year: number): Promise<FetchResult> {
  try {
    const result = await fetchWorldCupFromSources(year)
    writeCache(year, result.data)
    return { ...result, source: result.provider }
  } catch (liveError) {
    const cached = readCache(year)
    if (cached) {
      return {
        data: cached,
        provider: 'cache',
        providers: ['cache'],
        source: 'cache',
        fromCache: true,
        fetchedAt: new Date(),
      }
    }

    if (liveError instanceof TournamentLoadError) throw liveError
    throw new TournamentLoadError('loadFailed', { status: 'unknown' })
  }
}
