import type { WorldCupData } from '../types'
import { fetchWithTimeout } from './fetchWithTimeout'
import { getBundledWorldCupUrl, getLiveWorldCupUrl } from './worldCupDataUrls'
import { TournamentLoadError } from '../types/errors'

export type DataSource = 'live' | 'cache' | 'bundled'

export interface FetchResult {
  data: WorldCupData
  source: DataSource
  fetchedAt: Date
}

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

async function fetchBundled(year: number): Promise<WorldCupData | null> {
  try {
    const response = await fetchWithTimeout(getBundledWorldCupUrl(year), { timeoutMs: 10000 })
    if (!response.ok) return null
    return response.json() as Promise<WorldCupData>
  } catch {
    return null
  }
}

async function fetchLive(year: number): Promise<WorldCupData> {
  const response = await fetchWithTimeout(getLiveWorldCupUrl(year), { timeoutMs: 12000 })
  if (!response.ok) {
    throw new TournamentLoadError('loadFailed', { status: response.status })
  }
  return response.json() as Promise<WorldCupData>
}

export async function fetchWorldCupDataWithFallback(year: number): Promise<FetchResult> {
  try {
    const data = await fetchLive(year)
    writeCache(year, data)
    return { data, source: 'live', fetchedAt: new Date() }
  } catch (liveError) {
    const cached = readCache(year)
    if (cached) {
      return { data: cached, source: 'cache', fetchedAt: new Date() }
    }

    const bundled = await fetchBundled(year)
    if (bundled) {
      return { data: bundled, source: 'bundled', fetchedAt: new Date() }
    }

    throw liveError
  }
}
