import { fetchWithTimeout } from './fetchWithTimeout'
import { getBundledWorldCupUrl, getLiveWorldCupUrl } from './worldCupDataUrls'
import {
  getMaxSelectableYear,
  listPastWorldCupYears,
} from './worldCupYears'

const CACHE_KEY = 'wk-available-years-v1'
const CACHE_TTL_MS = 24 * 60 * 60 * 1000
const PROBE_TIMEOUT_MS = 4000
const PROBE_CONCURRENCY = 3
const DISCOVERY_DELAY_MS = 1500

interface CachedYears {
  years: number[]
  fetchedAt: number
}

function readCache(): number[] | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as CachedYears
    if (Date.now() - parsed.fetchedAt > CACHE_TTL_MS) return null
    return parsed.years
  } catch {
    return null
  }
}

function writeCache(years: number[]): void {
  try {
    const payload: CachedYears = { years, fetchedAt: Date.now() }
    localStorage.setItem(CACHE_KEY, JSON.stringify(payload))
  } catch {
    // storage full — ignore
  }
}

export function getCachedAvailableYears(): number[] | null {
  return readCache()
}

function hasDataCache(year: number): boolean {
  try {
    return localStorage.getItem(`wk-data-cache-${year}`) !== null
  } catch {
    return false
  }
}

async function hasBundledData(year: number): Promise<boolean> {
  try {
    const response = await fetchWithTimeout(getBundledWorldCupUrl(year), {
      method: 'HEAD',
      timeoutMs: PROBE_TIMEOUT_MS,
    })
    return response.ok
  } catch {
    return false
  }
}

async function hasLiveData(year: number): Promise<boolean> {
  try {
    const response = await fetchWithTimeout(getLiveWorldCupUrl(year), {
      method: 'GET',
      timeoutMs: PROBE_TIMEOUT_MS,
    })
    return response.ok
  } catch {
    return false
  }
}

export async function yearHasData(year: number): Promise<boolean> {
  if (hasDataCache(year)) return true
  if (await hasBundledData(year)) return true
  return hasLiveData(year)
}

async function mapPool<T, R>(
  items: T[],
  concurrency: number,
  mapper: (item: T) => Promise<R>,
): Promise<R[]> {
  const results = new Array<R>(items.length)
  let nextIndex = 0

  async function worker(): Promise<void> {
    while (nextIndex < items.length) {
      const index = nextIndex
      nextIndex += 1
      results[index] = await mapper(items[index])
    }
  }

  const workers = Array.from({ length: Math.min(concurrency, items.length) }, () =>
    worker(),
  )
  await Promise.all(workers)
  return results
}

export async function discoverAvailableYears(): Promise<number[]> {
  const currentEdition = getMaxSelectableYear()
  const available = new Set<number>([currentEdition])

  const pastYears = listPastWorldCupYears()
  const checks = await mapPool(pastYears, PROBE_CONCURRENCY, async (year) =>
    (await yearHasData(year)) ? year : null,
  )

  for (const year of checks) {
    if (year !== null) available.add(year)
  }

  const years = [...available].sort((a, b) => b - a)
  writeCache(years)
  return years
}

export function getDiscoveryDelayMs(): number {
  return readCache() ? 0 : DISCOVERY_DELAY_MS
}
