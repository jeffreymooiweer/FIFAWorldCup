import type { RawMatch } from '../../types'
import { fetchWithTimeout } from '../fetchWithTimeout'
import { getTournamentYear } from '../../config/tournament'
import type { WorldCupSource } from './types'

const GAMES_URL = 'https://worldcup26.ir/get/games'

interface WorldCup26Game {
  home_team_name_en?: string
  away_team_name_en?: string
  home_team_label?: string
  away_team_label?: string
  home_score?: string
  away_score?: string
  group?: string
  local_date?: string
  type?: string
  finished?: string
}

interface WorldCup26Response {
  games: WorldCup26Game[]
}

function parseLocalDate(value?: string): { date: string; time: string } {
  if (!value) return { date: '', time: '' }
  const [datePart, timePart] = value.split(' ')
  const [month, day, year] = datePart.split('/').map(Number)
  if (!year || !month || !day) return { date: '', time: '' }
  const date = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  return { date, time: timePart ?? '' }
}

function teamName(game: WorldCup26Game, side: 'home' | 'away'): string | null {
  const name = side === 'home' ? game.home_team_name_en : game.away_team_name_en
  const label = side === 'home' ? game.home_team_label : game.away_team_label
  const value = (name?.trim() || label?.trim() || '').trim()
  return value || null
}

function toRawMatch(game: WorldCup26Game): RawMatch | null {
  const team1 = teamName(game, 'home')
  const team2 = teamName(game, 'away')
  if (!team1 || !team2) return null

  const { date, time } = parseLocalDate(game.local_date)
  if (!date) return null

  const isKnockout = game.type && game.type !== 'group'
  const home = Number(game.home_score)
  const away = Number(game.away_score)
  const played = game.finished?.toUpperCase() === 'TRUE'

  return {
    round: isKnockout ? 'Knockout' : 'Matchday 1',
    date,
    time,
    team1,
    team2,
    group: !isKnockout && game.group ? `Group ${game.group}` : undefined,
    score:
      played && Number.isFinite(home) && Number.isFinite(away)
        ? { ft: [home, away] }
        : undefined,
  }
}

export const worldcup26Source: WorldCupSource = {
  id: 'worldcup26',
  priority: 20,
  isAvailable: (year) => year === getTournamentYear(),
  async fetch(year) {
    if (year !== getTournamentYear()) return null
    try {
      const response = await fetchWithTimeout(GAMES_URL, { timeoutMs: 12000 })
      if (!response.ok) return null
      const payload = (await response.json()) as WorldCup26Response
      const matches = payload.games
        .map(toRawMatch)
        .filter((m): m is RawMatch => m !== null)
      if (matches.length === 0) return null
      return { name: `World Cup ${year}`, matches }
    } catch {
      return null
    }
  },
}
