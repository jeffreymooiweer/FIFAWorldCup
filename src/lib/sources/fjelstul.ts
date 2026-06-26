import type { RawMatch, WorldCupData } from '../../types'
import { fetchWithTimeout } from '../fetchWithTimeout'
import { parseTournament, splitMatches } from '../parseTournament'
import type { WorldCupSource } from './types'

const FJELSTUL_URL =
  'https://raw.githubusercontent.com/jfjelstul/worldcup/master/data-json/worldcup.json'
const CACHE_PREFIX = 'wk-fjelstul-year-'
const MIN_YEAR = 1930
const MAX_YEAR = 2022

interface FjelstulMatch {
  tournament_id: string
  match_date: string
  match_time?: string
  stage_name: string
  group_name?: string
  home_team_name: string
  away_team_name: string
  home_team_score?: number
  away_team_score?: number
  stadium_name?: string
  city_name?: string
  country_name?: string
  extra_time?: number
  penalty_shootout?: number
  home_team_score_penalties?: number
  away_team_score_penalties?: number
}

interface FjelstulDatabase {
  matches: FjelstulMatch[]
}

let memoryCache: Map<number, WorldCupData> | null = null
let loadPromise: Promise<void> | null = null

function stageToRound(stage: string): string {
  switch (stage.toLowerCase()) {
    case 'group stage':
      return 'Matchday 1'
    case 'round of 16':
      return 'Round of 16'
    case 'quarter-finals':
      return 'Quarter-finals'
    case 'semi-finals':
      return 'Semi-finals'
    case 'third-place match':
    case 'third place match':
      return 'Third place play-off'
    case 'final':
      return 'Final'
    default:
      return stage
  }
}

function toRawMatch(match: FjelstulMatch): RawMatch {
  const hasScore =
    match.home_team_score !== undefined && match.away_team_score !== undefined
  const ground = [match.stadium_name, match.city_name, match.country_name]
    .filter(Boolean)
    .join(', ')

  return {
    round: stageToRound(match.stage_name),
    date: match.match_date,
    time: match.match_time ?? '',
    team1: match.home_team_name,
    team2: match.away_team_name,
    group: match.group_name ?? undefined,
    ground: ground || undefined,
    score: hasScore
      ? {
          ft: [match.home_team_score!, match.away_team_score!],
        }
      : undefined,
  }
}

function readYearCache(year: number): WorldCupData | null {
  try {
    const raw = localStorage.getItem(`${CACHE_PREFIX}${year}`)
    if (!raw) return null
    return JSON.parse(raw) as WorldCupData
  } catch {
    return null
  }
}

function writeYearCache(year: number, data: WorldCupData): void {
  try {
    localStorage.setItem(`${CACHE_PREFIX}${year}`, JSON.stringify(data))
  } catch {
    // quota — ignore
  }
}

async function loadFjelstulDatabase(): Promise<void> {
  if (memoryCache) return
  if (loadPromise) {
    await loadPromise
    return
  }

  loadPromise = (async () => {
    const response = await fetchWithTimeout(FJELSTUL_URL, { timeoutMs: 60000 })
    if (!response.ok) throw new Error(`fjelstul ${response.status}`)
    const db = (await response.json()) as FjelstulDatabase
    const byYear = new Map<number, RawMatch[]>()

    for (const match of db.matches) {
      const year = Number(match.tournament_id.replace('WC-', ''))
      if (!Number.isFinite(year)) continue
      const list = byYear.get(year) ?? []
      list.push(toRawMatch(match))
      byYear.set(year, list)
    }

    memoryCache = new Map()
    for (const [year, matches] of byYear) {
      const data: WorldCupData = {
        name: `World Cup ${year}`,
        matches,
      }
      memoryCache.set(year, data)
      writeYearCache(year, data)
    }
  })()

  try {
    await loadPromise
  } finally {
    loadPromise = null
  }
}

export const fjelstulSource: WorldCupSource = {
  id: 'fjelstul',
  priority: 60,
  isAvailable: (year) => year >= MIN_YEAR && year <= MAX_YEAR,
  async fetch(year) {
    if (year < MIN_YEAR || year > MAX_YEAR) return null

    const cached = readYearCache(year)
    if (cached) return cached

    await loadFjelstulDatabase()
    return memoryCache?.get(year) ?? null
  },
}

export function fjelstulHasYear(year: number): boolean {
  return year >= MIN_YEAR && year <= MAX_YEAR
}

export function listFjelstulYears(): number[] {
  const years: number[] = []
  for (let y = MAX_YEAR; y >= MIN_YEAR; y -= 4) {
    if (y === 1942 || y === 1946) continue
    years.push(y)
  }
  return years
}

export async function probeFjelstulYear(year: number): Promise<boolean> {
  if (!fjelstulHasYear(year)) return false
  const data = await fjelstulSource.fetch(year)
  if (!data) return false
  const { groupMatches } = splitMatches(parseTournament(data))
  return groupMatches.length > 0
}
