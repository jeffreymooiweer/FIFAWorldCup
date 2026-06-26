import type { WorldCupData } from '../types'
import { parseTournament, splitMatches } from './parseTournament'
import { fetchWithTimeout } from './fetchWithTimeout'
import { getBundledWorldCupUrl, getLiveWorldCupUrl } from './worldCupDataUrls'
import {
  getMaxSelectableYear,
  listPastWorldCupYearsToProbe,
} from './worldCupYears'

const CACHE_KEY = 'wk-available-years-v2'
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

export function removeYearFromCache(year: number): void {
  const cached = readCache()
  if (!cached?.includes(year)) return
  writeCache(cached.filter((y) => y !== year))
}

function isParseableWorldCupData(data: WorldCupData): boolean {
  try {
    const matches = parseTournament(data)
    const { groupMatches } = splitMatches(matches)
    return groupMatches.length > 0
  } catch {
    return false
  }
}

async function readCachedWorldCupData(year: number): Promise<WorldCupData | null> {
  try {
    const raw = localStorage.getItem(`wk-data-cache-${year}`)
    if (!raw) return null
    return JSON.parse(raw) as WorldCupData
  } catch {
    return null
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

export async function yearHasData(year: number): Promise<boolean> {
  const cachedData = await readCachedWorldCupData(year)
  if (cachedData && isParseableWorldCupData(cachedData)) return true

  if (await hasBundledData(year)) {
    try {
      const response = await fetchWithTimeout(getBundledWorldCupUrl(year), {
        timeoutMs: PROBE_TIMEOUT_MS,
      })
      if (!response.ok) return false
      const data = (await response.json()) as WorldCupData
      return isParseableWorldCupData(data)
    } catch {
      return false
    }
  }

  try {
    const response = await fetchWithTimeout(getLiveWorldCupUrl(year), {
      method: 'GET',
      timeoutMs: PROBE_TIMEOUT_MS,
    })
    if (!response.ok) return false
    const data = (await response.json()) as WorldCupData
    return isParseableWorldCupData(data)
  } catch {
    return false
  }
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

  const pastYears = listPastWorldCupYearsToProbe()
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
