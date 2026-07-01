import type { RawMatch, WorldCupData } from '../../types'
import type { DataProvider } from './types'

const TEAM_ALIASES: Record<string, string> = {
  'united states': 'usa',
  'united states of america': 'usa',
  'south korea': 'korea republic',
  'korea republic': 'south korea',
  'korea, republic of': 'south korea',
  'ir iran': 'iran',
  "cote d'ivoire": 'ivory coast',
  'côte d\'ivoire': 'ivory coast',
  turkiye: 'turkey',
  'west germany': 'germany',
}

export function normalizeTeamName(name: string | undefined | null): string {
  const base = (name ?? '')
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
  return TEAM_ALIASES[base] ?? base
}

export function matchKey(match: Pick<RawMatch, 'date' | 'team1' | 'team2'>): string | null {
  if (!match.date || !match.team1?.trim() || !match.team2?.trim()) return null
  const teams = [normalizeTeamName(match.team1), normalizeTeamName(match.team2)].sort()
  return `${match.date}|${teams[0]}|${teams[1]}`
}

function pickScore(
  primary: RawMatch['score'],
  secondary: RawMatch['score'],
): RawMatch['score'] {
  if (!secondary) return primary
  if (!primary) return secondary
  return primary
}

export function mergeWorldCupData(base: WorldCupData, extra: WorldCupData): WorldCupData {
  const extraByKey = new Map<string, RawMatch>()
  for (const match of extra.matches) {
    const key = matchKey(match)
    if (key) extraByKey.set(key, match)
  }

  const mergedMatches = base.matches.map((match) => {
    const key = matchKey(match)
    const other = key ? extraByKey.get(key) : undefined
    if (!other) return match
    return {
      ...match,
      time: match.time?.trim() ? match.time : other.time,
      ground: match.ground?.trim() ? match.ground : other.ground,
      score: pickScore(match.score, other.score),
      num: match.num ?? other.num,
    }
  })

  const baseKeys = new Set(
    base.matches.map(matchKey).filter((key): key is string => key !== null),
  )
  for (const match of extra.matches) {
    const key = matchKey(match)
    if (!key || baseKeys.has(key)) continue
    if (!match.team1?.trim() || !match.team2?.trim()) continue
    mergedMatches.push(match)
  }

  return {
    name: base.name || extra.name,
    matches: mergedMatches,
  }
}

export function sortByProviderPriority<T extends { provider: DataProvider }>(
  items: T[],
  priority: DataProvider[],
): T[] {
  return [...items].sort(
    (a, b) => priority.indexOf(a.provider) - priority.indexOf(b.provider),
  )
}
