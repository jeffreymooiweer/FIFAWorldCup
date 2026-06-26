import type { GroupStanding, Match } from '../types'
import { deriveGroupsFromMatches } from './groups'

interface TeamStats {
  team: string
  played: number
  won: number
  drawn: number
  lost: number
  goalsFor: number
  goalsAgainst: number
}

function emptyStats(team: string): TeamStats {
  return {
    team,
    played: 0,
    won: 0,
    drawn: 0,
    lost: 0,
    goalsFor: 0,
    goalsAgainst: 0,
  }
}

function compareTeams(a: TeamStats, b: TeamStats): number {
  const pointsA = a.won * 3 + a.drawn
  const pointsB = b.won * 3 + b.drawn
  if (pointsB !== pointsA) return pointsB - pointsA
  const gdA = a.goalsFor - a.goalsAgainst
  const gdB = b.goalsFor - b.goalsAgainst
  if (gdB !== gdA) return gdB - gdA
  if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor
  return a.team.localeCompare(b.team)
}

function getTeamsInGroup(matches: Match[], group: string): string[] {
  const teams = new Set<string>()
  for (const m of matches) {
    if (m.group === group) {
      teams.add(m.team1)
      teams.add(m.team2)
    }
  }
  return [...teams]
}

export function calculateStandings(groupMatches: Match[]): GroupStanding[] {
  const standings: GroupStanding[] = []
  const groups = deriveGroupsFromMatches(groupMatches)

  for (const group of groups) {
    const teams = getTeamsInGroup(groupMatches, group)
    const stats = new Map<string, TeamStats>()
    for (const team of teams) {
      stats.set(team, emptyStats(team))
    }

    for (const m of groupMatches) {
      if (m.group !== group || !m.played || !m.score) continue
      const [g1, g2] = m.score
      const s1 = stats.get(m.team1)
      const s2 = stats.get(m.team2)
      if (!s1 || !s2) continue

      s1.played += 1
      s2.played += 1
      s1.goalsFor += g1
      s1.goalsAgainst += g2
      s2.goalsFor += g2
      s2.goalsAgainst += g1

      if (g1 > g2) {
        s1.won += 1
        s2.lost += 1
      } else if (g2 > g1) {
        s2.won += 1
        s1.lost += 1
      } else {
        s1.drawn += 1
        s2.drawn += 1
      }
    }

    const ranked = [...stats.values()].sort(compareTeams)
    ranked.forEach((s, index) => {
      standings.push({
        group,
        position: index + 1,
        team: s.team,
        played: s.played,
        won: s.won,
        drawn: s.drawn,
        lost: s.lost,
        goalsFor: s.goalsFor,
        goalsAgainst: s.goalsAgainst,
        goalDiff: s.goalsFor - s.goalsAgainst,
        points: s.won * 3 + s.drawn,
      })
    })
  }

  return standings
}

export function getGroupTable(
  standings: GroupStanding[],
  group: string,
): GroupStanding[] {
  return standings
    .filter((s) => s.group === group)
    .sort((a, b) => a.position - b.position)
}

export function getThirdPlaceRanking(standings: GroupStanding[]): GroupStanding[] {
  return standings
    .filter((s) => s.position === 3)
    .sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points
      if (b.goalDiff !== a.goalDiff) return b.goalDiff - a.goalDiff
      if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor
      return a.team.localeCompare(b.team)
    })
}
