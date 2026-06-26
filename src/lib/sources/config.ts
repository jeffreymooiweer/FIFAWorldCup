import type { DataProvider } from './types'

export function hasFootballDataToken(): boolean {
  return Boolean(import.meta.env.VITE_FOOTBALL_DATA_TOKEN?.trim())
}

export function hasApiFootballKey(): boolean {
  return Boolean(import.meta.env.VITE_API_FOOTBALL_KEY?.trim())
}

export function hasZafronixKey(): boolean {
  return Boolean(import.meta.env.VITE_ZAFRONIX_API_KEY?.trim())
}

/** Primary sort order when merging multiple successful sources. */
export const PROVIDER_PRIORITY: DataProvider[] = [
  'openfootball',
  'worldcup26',
  'api-football',
  'football-data',
  'zafronix',
  'fjelstul',
  'bundled',
  'cache',
]

export function isProviderEnabled(id: DataProvider): boolean {
  switch (id) {
    case 'openfootball':
    case 'fjelstul':
    case 'bundled':
    case 'cache':
      return true
    case 'worldcup26':
      return true
    case 'football-data':
      return hasFootballDataToken()
    case 'api-football':
      return hasApiFootballKey()
    case 'zafronix':
      return hasZafronixKey()
    default:
      return false
  }
}
