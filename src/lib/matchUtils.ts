import type { Match } from '../types'
import { parseMatchDateTime } from './dates'

export function findNextMatch(matches: Match[], now = new Date()): Match | null {
  const upcoming = matches
    .filter((m) => !m.played)
    .map((m) => ({ match: m, date: parseMatchDateTime(m.date, m.time) }))
    .filter(({ date }) => date.getTime() > now.getTime())
    .sort((a, b) => a.date.getTime() - b.date.getTime())

  return upcoming[0]?.match ?? null
}

export function getCountdownParts(target: Date, now = new Date()) {
  const diff = Math.max(0, target.getTime() - now.getTime())
  const totalSeconds = Math.floor(diff / 1000)
  const days = Math.floor(totalSeconds / 86400)
  const hours = Math.floor((totalSeconds % 86400) / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  return { days, hours, minutes, seconds, totalSeconds }
}

function isNetherlandsTeam(team: string): boolean {
  return team === 'Netherlands'
}

export function matchInvolvesNetherlands(match: Match): boolean {
  return isNetherlandsTeam(match.team1) || isNetherlandsTeam(match.team2)
}
