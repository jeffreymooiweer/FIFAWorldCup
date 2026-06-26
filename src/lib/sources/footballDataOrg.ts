import type { RawMatch } from '../../types'
import { fetchWithTimeout } from '../fetchWithTimeout'
import type { WorldCupSource } from './types'

const BASE = 'https://api.football-data.org/v4'

interface FootballDataMatch {
  utcDate: string
  status: string
  matchday?: number
  stage?: string
  group?: string
  homeTeam: { name: string }
  awayTeam: { name: string }
  score?: {
    fullTime?: { home: number | null; away: number | null }
  }
  venue?: string
}

interface FootballDataResponse {
  matches: FootballDataMatch[]
}

function stageToRound(stage?: string, matchday?: number): string {
  if (stage === 'GROUP_STAGE' && matchday) return `Matchday ${matchday}`
  if (stage === 'LAST_16') return 'Round of 16'
  if (stage === 'QUARTER_FINALS') return 'Quarter-finals'
  if (stage === 'SEMI_FINALS') return 'Semi-finals'
  if (stage === 'THIRD_PLACE') return 'Match for third place'
  if (stage === 'FINAL') return 'Final'
  if (stage === 'ROUND_OF_32') return 'Round of 32'
  return stage ?? 'Knockout'
}

function groupLabel(group?: string): string | undefined {
  if (!group) return undefined
  const letter = group.replace('GROUP_', '')
  return `Group ${letter}`
}

function toRawMatch(match: FootballDataMatch): RawMatch {
  const date = match.utcDate.slice(0, 10)
  const time = match.utcDate.length >= 16 ? match.utcDate.slice(11, 16) : ''
  const home = match.score?.fullTime?.home
  const away = match.score?.fullTime?.away
  const played = match.status === 'FINISHED' && home !== null && away !== null

  return {
    round: stageToRound(match.stage, match.matchday),
    date,
    time,
    team1: match.homeTeam.name,
    team2: match.awayTeam.name,
    group: groupLabel(match.group),
    ground: match.venue,
    score: played ? { ft: [home!, away!] } : undefined,
  }
}

export const footballDataOrgSource: WorldCupSource = {
  id: 'football-data',
  priority: 40,
  isAvailable: () => Boolean(import.meta.env.VITE_FOOTBALL_DATA_TOKEN?.trim()),
  async fetch(year) {
    const token = import.meta.env.VITE_FOOTBALL_DATA_TOKEN?.trim()
    if (!token) return null

    try {
      const response = await fetchWithTimeout(
        `${BASE}/competitions/WC/matches?season=${year}`,
        {
          timeoutMs: 12000,
          headers: { 'X-Auth-Token': token },
        },
      )
      if (!response.ok) return null
      const payload = (await response.json()) as FootballDataResponse
      const matches = (payload.matches ?? []).map(toRawMatch)
      if (matches.length === 0) return null
      return { name: `World Cup ${year}`, matches }
    } catch {
      return null
    }
  },
}
