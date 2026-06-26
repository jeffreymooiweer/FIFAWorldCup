import type { Match } from '../types'

const GROUP_LETTER_RE = /^[A-Z]$/

/** Derives sorted group letters (A, B, C, …) from match data. */
export function deriveGroupsFromMatches(matches: Match[]): string[] {
  const groups = new Set<string>()
  for (const match of matches) {
    if (match.group && GROUP_LETTER_RE.test(match.group)) {
      groups.add(match.group)
    }
  }
  return [...groups].sort()
}

/** Splits groups evenly between left and right poster columns. */
export function splitGroupsForPoster(groups: string[]): {
  left: string[]
  right: string[]
} {
  const midpoint = Math.ceil(groups.length / 2)
  return {
    left: groups.slice(0, midpoint),
    right: groups.slice(midpoint),
  }
}

export function parseGroupLetter(group?: string): string | null {
  if (!group) return null
  const direct = group.trim().toUpperCase()
  if (GROUP_LETTER_RE.test(direct)) return direct
  const match = group.match(/Group\s+([A-Z])/i)
  return match ? match[1].toUpperCase() : null
}
