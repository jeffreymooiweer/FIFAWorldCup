import type { Match } from '../types'
import { parseMatchDateTime } from './dates'

const MATCH_DURATION_MS = 2 * 60 * 60 * 1000

export function isMatchLive(match: Match, now: Date = new Date()): boolean {
  if (match.played) return false
  const kickoff = parseMatchDateTime(match.date, match.time)
  const end = new Date(kickoff.getTime() + MATCH_DURATION_MS)
  return now >= kickoff && now <= end
}
