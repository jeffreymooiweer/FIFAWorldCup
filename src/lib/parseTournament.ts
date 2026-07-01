import type { RawMatch, RawScore, WorldCupData, Match } from '../types'
import { parseGroupLetter } from './groups'

export function scoresFromRaw(raw?: RawScore): {
  score: [number, number] | null
  resultScore: [number, number] | null
} {
  const ft = raw?.ft
  if (!ft) return { score: null, resultScore: null }
  const [home, away] = ft
  if (home !== away) {
    return { score: ft, resultScore: ft }
  }
  const penalties = raw?.p
  if (penalties && penalties[0] !== penalties[1]) {
    return { score: ft, resultScore: penalties }
  }
  return { score: ft, resultScore: ft }
}

const PLACEHOLDER_RE = /^(\d[A-Z](?:\/[A-Z\/]+)?|W\d+|L\d+)$/

export function isPlaceholder(team: string): boolean {
  return PLACEHOLDER_RE.test(team.trim())
}

function getKnockoutStartNumber(matches: RawMatch[]): number {
  const existing = matches
    .filter((m) => !m.group && m.num != null)
    .map((m) => m.num as number)
  if (existing.length > 0) return Math.min(...existing)
  return 73
}

function assignMatchNumbers(matches: RawMatch[]): RawMatch[] {
  let knockoutIndex = getKnockoutStartNumber(matches)
  return matches.map((m) => {
    if (m.group) return m
    if (m.num) return m
    const withNum = { ...m, num: knockoutIndex }
    knockoutIndex += 1
    return withNum
  })
}

function normalizeMatch(raw: RawMatch, index: number, knockoutStart: number): Match {
  const { score, resultScore } = scoresFromRaw(raw.score)
  return {
    num: raw.num ?? (raw.group ? null : knockoutStart + index),
    round: raw.round,
    date: raw.date,
    time: raw.time ?? '',
    team1: raw.team1,
    team2: raw.team2,
    score,
    resultScore,
    group: parseGroupLetter(raw.group),
    ground: raw.ground ?? null,
    played: score !== null,
  }
}

export function parseTournament(data: WorldCupData): Match[] {
  const knockoutStart = getKnockoutStartNumber(data.matches)
  const numbered = assignMatchNumbers(data.matches)
  return numbered.map((m, i) => normalizeMatch(m, i, knockoutStart))
}

export function splitMatches(matches: Match[]): {
  groupMatches: Match[]
  knockoutMatches: Match[]
} {
  const groupMatches = matches.filter((m) => m.group !== null)
  const knockoutMatches = matches
    .filter((m) => m.group === null && m.num !== null)
    .sort((a, b) => (a.num ?? 0) - (b.num ?? 0))
  return { groupMatches, knockoutMatches }
}
