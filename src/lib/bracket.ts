import type { GroupStanding, Match, ResolvedMatch } from '../types'
import { isPlaceholder } from './parseTournament'
import { getThirdPlaceRanking } from './standings'

const POSITION_GROUP_RE = /^(\d)([A-Z])$/
const THIRD_PLACE_RE = /^3([A-Z](?:\/[A-Z])*)$/
const WINNER_RE = /^W(\d+)$/
const LOSER_RE = /^L(\d+)$/

function getTeamByPosition(
  standings: GroupStanding[],
  position: number,
  group: string,
): string | null {
  const row = standings.find((s) => s.group === group && s.position === position)
  return row?.team ?? null
}

function countThirdPlaceSlots(knockoutMatches: Match[]): number {
  let maxSlots = 8
  for (const match of knockoutMatches) {
    for (const team of [match.team1, match.team2]) {
      const label = team.match(THIRD_PLACE_RE)
      if (label) {
        maxSlots = Math.max(maxSlots, label[1].split('/').length)
      }
    }
  }
  return maxSlots
}

function resolveThirdPlaceholder(
  label: string,
  standings: GroupStanding[],
  knockoutMatches: Match[],
): string | null {
  const match = label.match(THIRD_PLACE_RE)
  if (!match) return null

  const candidateGroups = match[1].split('/')
  const slots = countThirdPlaceSlots(knockoutMatches)
  const qualifiedThirds = getThirdPlaceRanking(standings).slice(0, slots)
  const qualifiedGroups = new Set(qualifiedThirds.map((s) => s.group))

  for (const group of candidateGroups) {
    if (qualifiedGroups.has(group)) {
      return getTeamByPosition(standings, 3, group)
    }
  }

  return null
}

function getMatchWinner(match: ResolvedMatch): string | null {
  if (!match.played || !match.score) return null
  const [s1, s2] = match.score
  if (s1 > s2) return match.resolvedTeam1
  if (s2 > s1) return match.resolvedTeam2
  return null
}

function getMatchLoser(match: ResolvedMatch): string | null {
  if (!match.played || !match.score) return null
  const [s1, s2] = match.score
  if (s1 > s2) return match.resolvedTeam2
  if (s2 > s1) return match.resolvedTeam1
  return null
}

function resolveSlot(
  raw: string,
  standings: GroupStanding[],
  resolved: Map<number, ResolvedMatch>,
  knockoutMatches: Match[],
): { team: string; isPlaceholder: boolean } {
  if (!isPlaceholder(raw)) {
    return { team: raw, isPlaceholder: false }
  }

  const posGroup = raw.match(POSITION_GROUP_RE)
  if (posGroup) {
    const team = getTeamByPosition(standings, Number(posGroup[1]), posGroup[2])
    return { team: team ?? raw, isPlaceholder: team === null }
  }

  if (raw.startsWith('3')) {
    const team = resolveThirdPlaceholder(raw, standings, knockoutMatches)
    return { team: team ?? raw, isPlaceholder: team === null }
  }

  const winnerMatch = raw.match(WINNER_RE)
  if (winnerMatch) {
    const num = Number(winnerMatch[1])
    const source = resolved.get(num)
    const team = source ? getMatchWinner(source) : null
    return { team: team ?? raw, isPlaceholder: team === null }
  }

  const loserMatch = raw.match(LOSER_RE)
  if (loserMatch) {
    const num = Number(loserMatch[1])
    const source = resolved.get(num)
    const team = source ? getMatchLoser(source) : null
    return { team: team ?? raw, isPlaceholder: team === null }
  }

  return { team: raw, isPlaceholder: true }
}

export function resolveKnockoutBracket(
  knockoutMatches: Match[],
  standings: GroupStanding[],
): Map<number, ResolvedMatch> {
  const sorted = [...knockoutMatches].sort((a, b) => (a.num ?? 0) - (b.num ?? 0))
  const resolved = new Map<number, ResolvedMatch>()

  for (const match of sorted) {
    if (!match.num) continue

    const slot1 = resolveSlot(match.team1, standings, resolved, knockoutMatches)
    const slot2 = resolveSlot(match.team2, standings, resolved, knockoutMatches)

    const entry: ResolvedMatch = {
      ...match,
      resolvedTeam1: slot1.team,
      resolvedTeam2: slot2.team,
      isPlaceholder1: slot1.isPlaceholder,
      isPlaceholder2: slot2.isPlaceholder,
      winner: null,
    }

    if (match.played && match.score) {
      entry.winner = getMatchWinner(entry)
    }

    resolved.set(match.num, entry)
  }

  return resolved
}

export function getChampion(
  resolved: Map<number, ResolvedMatch>,
  finalMatchNum: number | null,
): string | null {
  if (finalMatchNum === null) return null
  const final = resolved.get(finalMatchNum)
  if (!final?.played || !final.score) return null
  return final.winner
}

export function getGroupMatchesForGroup(
  groupMatches: Match[],
  group: string,
): Match[] {
  return groupMatches
    .filter((m) => m.group === group)
    .sort(
      (a, b) =>
        a.date.localeCompare(b.date) || (a.time ?? '').localeCompare(b.time ?? ''),
    )
}
