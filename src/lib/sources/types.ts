import type { WorldCupData } from '../../types'

export type DataProvider =
  | 'openfootball'
  | 'fjelstul'
  | 'worldcup26'
  | 'football-data'
  | 'api-football'
  | 'zafronix'
  | 'bundled'
  | 'cache'

export interface SourceFetchResult {
  data: WorldCupData
  provider: DataProvider
}

export interface WorldCupSource {
  id: DataProvider
  /** Lower = tried first as primary base */
  priority: number
  isAvailable: (year: number) => boolean
  fetch: (year: number) => Promise<WorldCupData | null>
}

export interface MergedFetchResult {
  data: WorldCupData
  provider: DataProvider
  providers: DataProvider[]
  fromCache: boolean
  fetchedAt: Date
}
