import { getLiveWorldCupUrl } from '../worldCupDataUrls'
import { fetchWithTimeout } from '../fetchWithTimeout'
import type { WorldCupData } from '../../types'
import type { WorldCupSource } from './types'

export const openfootballSource: WorldCupSource = {
  id: 'openfootball',
  priority: 10,
  isAvailable: () => true,
  async fetch(year) {
    try {
      const response = await fetchWithTimeout(getLiveWorldCupUrl(year), { timeoutMs: 12000 })
      if (!response.ok) return null
      return (await response.json()) as WorldCupData
    } catch {
      return null
    }
  },
}
