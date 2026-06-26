import { getBundledWorldCupUrl } from '../worldCupDataUrls'
import { fetchWithTimeout } from '../fetchWithTimeout'
import type { WorldCupData } from '../../types'
import type { WorldCupSource } from './types'

export const bundledSource: WorldCupSource = {
  id: 'bundled',
  priority: 90,
  isAvailable: () => true,
  async fetch(year) {
    try {
      const response = await fetchWithTimeout(getBundledWorldCupUrl(year), { timeoutMs: 10000 })
      if (!response.ok) return null
      return (await response.json()) as WorldCupData
    } catch {
      return null
    }
  },
}
