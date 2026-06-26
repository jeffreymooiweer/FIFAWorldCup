import type { EditionConfig } from './editions/types'
import type { KnockoutLayout } from '../lib/knockout'
import type { BracketHalfConfig, BracketSlot } from '../lib/bracketLayout'

/** Official 2026 poster slot order (differs from numeric sort). */
const POSTER_2026_LEFT: BracketHalfConfig = {
  side: 'left',
  rounds: [
    { key: 'r32', column: 1, slots: slotRows([1, 3, 5, 7, 9, 11, 13, 15], [73, 74, 75, 76, 77, 78, 79, 80]) },
    { key: 'r16', column: 2, slots: slotRows([2, 6, 10, 14], [90, 89, 91, 92]) },
    { key: 'qf', column: 3, slots: slotRows([4, 12], [97, 99]) },
    { key: 'sf', column: 4, slots: slotRows([8], [101]) },
  ],
}

const POSTER_2026_RIGHT: BracketHalfConfig = {
  side: 'right',
  rounds: [
    { key: 'sf', column: 1, slots: slotRows([8], [102]) },
    { key: 'qf', column: 2, slots: slotRows([4, 12], [98, 100]) },
    { key: 'r16', column: 3, slots: slotRows([2, 6, 10, 14], [94, 93, 96, 95]) },
    { key: 'r32', column: 4, slots: slotRows([1, 3, 5, 7, 9, 11, 13, 15], [81, 82, 83, 84, 85, 86, 87, 88]) },
  ],
}

function slotRows(rows: number[], matchNums: number[]): BracketSlot[] {
  return rows.map((row, index) => ({
    row,
    span: 2,
    matchNum: matchNums[index] ?? 0,
  }))
}

function slotRowsAuto(matchNums: number[]): BracketSlot[] {
  const rows = matchNums.map((_, index) => index * 2 + 1)
  return slotRows(rows, matchNums)
}

function buildHalf(
  side: 'left' | 'right',
  layout: KnockoutLayout,
): BracketHalfConfig {
  const r32 = side === 'left' ? layout.r32Left : layout.r32Right
  const r16 = side === 'left' ? layout.r16Left : layout.r16Right
  const qf = side === 'left' ? layout.quarterFinals.slice(0, 2) : layout.quarterFinals.slice(2)
  const sf = side === 'left' ? layout.semiFinals.slice(0, 1) : layout.semiFinals.slice(1)

  if (side === 'left') {
    return {
      side,
      rounds: [
        { key: 'r32', column: 1, slots: slotRowsAuto(r32) },
        { key: 'r16', column: 2, slots: slotRowsAuto(r16) },
        { key: 'qf', column: 3, slots: slotRowsAuto(qf) },
        { key: 'sf', column: 4, slots: slotRowsAuto(sf) },
      ].filter((round) => round.slots.length > 0),
    }
  }

  return {
    side,
    rounds: [
      { key: 'sf', column: 1, slots: slotRowsAuto(sf) },
      { key: 'qf', column: 2, slots: slotRowsAuto(qf) },
      { key: 'r16', column: 3, slots: slotRowsAuto(r16) },
      { key: 'r32', column: 4, slots: slotRowsAuto(r32) },
    ].filter((round) => round.slots.length > 0),
  }
}

export interface PosterBracketConfig {
  left: BracketHalfConfig
  right: BracketHalfConfig
  rows: number
}

export function getPosterBracket(
  edition: EditionConfig,
  layout: KnockoutLayout,
): PosterBracketConfig {
  if (
    edition.posterLayout === 'official-2026' &&
    (layout.byRound.r32?.length ?? 0) === 16
  ) {
    return { left: POSTER_2026_LEFT, right: POSTER_2026_RIGHT, rows: 16 }
  }

  const slotsPerSide = Math.max(layout.r32Left.length, layout.r32Right.length, 1)
  const rows = Math.max(16, slotsPerSide * 2)

  return {
    left: buildHalf('left', layout),
    right: buildHalf('right', layout),
    rows,
  }
}
