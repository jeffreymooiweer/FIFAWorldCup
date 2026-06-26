import type { RawMatch } from '../../types'
import { fetchWithTimeout } from '../fetchWithTimeout'
import type { WorldCupSource } from './types'

const BASE = 'https://api.zafronix.com/fifa/worldcup/v1'

interface ZafronixMatch {
  date: string
  kickoff?: string
  stage: string
  homeTeam: string
  awayTeam: string
  homeScore?: number | null
  awayScore?: number | null
  stadium?: string
  city?: string
}

interface ZafronixMatchesResponse {
  year: number
  count: number
  data: ZafronixMatch[]
}

function stageToRound(stage: string): string {
  switch (stage) {
    case 'group':
      return 'Matchday 1'
    case 'r16':
      return 'Round of 16'
    case 'qf':
      return 'Quarter-finals'
    case 'sf':
      return 'Semi-finals'
    case 'third':
      return 'Third place play-off'
    case 'final':
      return 'Final'
    case 'r32':
      return 'Round of 32'
    default:
      return stage
  }
}

function toRawMatch(match: ZafronixMatch): RawMatch {
  const home = match.homeScore
  const away = match.awayScore
  const played = home !== null && away !== null && home !== undefined && away !== undefined
  const ground = [match.stadium, match.city].filter(Boolean).join(', ')

  return {
    round: stageToRound(match.stage),
    date: match.date,
    time: match.kickoff ?? '',
    team1: match.homeTeam,
    team2: match.awayTeam,
    ground: ground || undefined,
    score: played ? { ft: [home!, away!] } : undefined,
  }
}

export const zafronixSource: WorldCupSource = {
  id: 'zafronix',
  priority: 50,
  isAvailable: () => Boolean(import.meta.env.VITE_ZAFRONIX_API_KEY?.trim()),
  async fetch(year) {
    const key = import.meta.env.VITE_ZAFRONIX_API_KEY?.trim()
    if (!key) return null

    try {
      const response = await fetchWithTimeout(
        `${BASE}/matches?year=${year}&denormalize=true`,
        {
          timeoutMs: 12000,
          headers: { 'X-API-Key': key },
        },
      )
      if (!response.ok) return null
      const payload = (await response.json()) as ZafronixMatchesResponse
      const matches = (payload.data ?? []).map(toRawMatch)
      if (matches.length === 0) return null
      return { name: `World Cup ${year}`, matches }
    } catch {
      return null
    }
  },
}
