import type { WorldCupData } from '../types'
import { deriveGroupsFromMatches } from './groups'
import { parseTournament, splitMatches } from './parseTournament'

const KNOWN_ROUNDS = new Set([
  'Matchday 1',
  'Matchday 2',
  'Matchday 3',
  'Matchday 8',
  'Matchday 9',
  'Matchday 14',
  'Round of 32',
  'Round of 16',
  'Quarter-final',
  'Quarter-finals',
  'Semi-final',
  'Semi-finals',
  'Match for third place',
  'Third place play-off',
  'Third-place play-off',
  'Final',
])

export function validateTournamentStructure(data: WorldCupData): string[] {
  const warnings: string[] = []
  const matches = parseTournament(data)
  const { groupMatches, knockoutMatches } = splitMatches(matches)
  const groups = deriveGroupsFromMatches(groupMatches)

  if (groups.length === 0) {
    warnings.push('noGroups')
  } else if (groups.length > 16) {
    warnings.push('manyGroups')
  }

  const unknownRounds = new Set<string>()
  for (const m of matches) {
    if (!KNOWN_ROUNDS.has(m.round) && !m.round.startsWith('Matchday')) {
      unknownRounds.add(m.round)
    }
  }
  if (unknownRounds.size > 0) {
    warnings.push('unknownRounds')
  }

  if (knockoutMatches.length === 0 && groupMatches.length > 0) {
    warnings.push('noKnockout')
  }

  return warnings
}
