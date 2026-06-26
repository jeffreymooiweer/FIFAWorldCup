import type { Match } from '../types'

export interface KnockoutLayout {
  byRound: Record<string, number[]>
  r32Left: number[]
  r32Right: number[]
  r16Left: number[]
  r16Right: number[]
  quarterFinals: number[]
  semiFinals: number[]
  thirdPlace: number | null
  final: number | null
}

const ROUND_TO_KEY: Record<string, string> = {
  'Round of 32': 'r32',
  'Round of 16': 'r16',
  'Quarter-final': 'qf',
  'Quarter-finals': 'qf',
  'Semi-final': 'sf',
  'Semi-finals': 'sf',
  'Match for third place': 'thirdPlace',
  'Third place play-off': 'thirdPlace',
  'Third-place play-off': 'thirdPlace',
  Final: 'final',
}

function roundKey(round: string): string {
  return ROUND_TO_KEY[round] ?? round.toLowerCase().replace(/\s+/g, '-')
}

function splitHalf(nums: number[]): [number[], number[]] {
  if (nums.length === 0) return [[], []]
  const mid = Math.ceil(nums.length / 2)
  return [nums.slice(0, mid), nums.slice(mid)]
}

/** Infers knockout structure from API match data (format-agnostic). */
export function inferKnockoutLayout(knockoutMatches: Match[]): KnockoutLayout {
  const byRound: Record<string, number[]> = {}

  for (const match of knockoutMatches) {
    if (!match.num) continue
    const key = roundKey(match.round)
    if (!byRound[key]) byRound[key] = []
    byRound[key].push(match.num)
  }

  for (const key of Object.keys(byRound)) {
    byRound[key].sort((a, b) => a - b)
  }

  const [r32Left, r32Right] = splitHalf(byRound.r32 ?? [])
  const [r16Left, r16Right] = splitHalf(byRound.r16 ?? [])
  const thirdPlace = byRound.thirdPlace?.[0] ?? null
  const finalMatch = byRound.final?.[0] ?? null

  return {
    byRound,
    r32Left,
    r32Right,
    r16Left,
    r16Right,
    quarterFinals: byRound.qf ?? [],
    semiFinals: byRound.sf ?? [],
    thirdPlace,
    final: finalMatch,
  }
}

export function getKnockoutListOrder(layout: KnockoutLayout): Array<{
  key: string
  nums: number[]
}> {
  const rounds: Array<{ key: string; nums: number[] }> = []

  if (layout.byRound.r32?.length) {
    rounds.push({ key: 'r32', nums: [...layout.r32Left, ...layout.r32Right] })
  }
  if (layout.byRound.r16?.length) {
    rounds.push({ key: 'r16', nums: [...layout.r16Left, ...layout.r16Right] })
  }
  if (layout.quarterFinals.length) {
    rounds.push({ key: 'qf', nums: layout.quarterFinals })
  }
  if (layout.semiFinals.length) {
    rounds.push({ key: 'sf', nums: layout.semiFinals })
  }
  if (layout.thirdPlace !== null || layout.final !== null) {
    rounds.push({
      key: 'finals',
      nums: [layout.thirdPlace, layout.final].filter((n): n is number => n !== null),
    })
  }

  return rounds
}
