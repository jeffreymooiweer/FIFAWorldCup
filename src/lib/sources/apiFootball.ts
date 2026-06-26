import type { RawMatch } from '../../types'
import { fetchWithTimeout } from '../fetchWithTimeout'
import type { WorldCupSource } from './types'

const BASE = 'https://v3.football.api-sports.io'

interface ApiFootballFixture {
  fixture: { id: number; date: string; status: { short: string } }
  league: { round?: string }
  teams: { home: { name: string }; away: { name: string } }
  goals: { home: number | null; away: number | null }
  score: { fulltime: { home: number | null; away: number | null } }
}

interface ApiFootballResponse {
  response: ApiFootballFixture[]
}

function roundFromLeagueRound(round?: string): string {
  if (!round) return 'Knockout'
  if (round.includes('Group')) return round.replace('Group', 'Matchday').replace('-', ' ')
  if (round.includes('Round of 16')) return 'Round of 16'
  if (round.includes('Quarter')) return 'Quarter-finals'
  if (round.includes('Semi')) return 'Semi-finals'
  if (round.includes('3rd Place')) return 'Match for third place'
  if (round === 'Final') return 'Final'
  if (round.includes('Round of 32')) return 'Round of 32'
  return round
}

function groupFromRound(round?: string): string | undefined {
  const match = round?.match(/Group\s*-\s*([A-Z])/i)
  return match ? `Group ${match[1].toUpperCase()}` : undefined
}

function toRawMatch(item: ApiFootballFixture): RawMatch {
  const date = item.fixture.date.slice(0, 10)
  const time = item.fixture.date.slice(11, 16)
  const home = item.score.fulltime.home ?? item.goals.home
  const away = item.score.fulltime.away ?? item.goals.away
  const played = item.fixture.status.short === 'FT' && home !== null && away !== null
  const round = item.league.round ?? ''

  return {
    round: roundFromLeagueRound(round),
    num: item.fixture.id,
    date,
    time,
    team1: item.teams.home.name,
    team2: item.teams.away.name,
    group: groupFromRound(round),
    score: played ? { ft: [home!, away!] } : undefined,
  }
}

export const apiFootballSource: WorldCupSource = {
  id: 'api-football',
  priority: 30,
  isAvailable: () => Boolean(import.meta.env.VITE_API_FOOTBALL_KEY?.trim()),
  async fetch(year) {
    const key = import.meta.env.VITE_API_FOOTBALL_KEY?.trim()
    if (!key) return null

    try {
      const response = await fetchWithTimeout(
        `${BASE}/fixtures?league=1&season=${year}`,
        {
          timeoutMs: 12000,
          headers: { 'x-apisports-key': key },
        },
      )
      if (!response.ok) return null
      const payload = (await response.json()) as ApiFootballResponse
      const matches = (payload.response ?? []).map(toRawMatch)
      if (matches.length === 0) return null
      return { name: `World Cup ${year}`, matches }
    } catch {
      return null
    }
  },
}
