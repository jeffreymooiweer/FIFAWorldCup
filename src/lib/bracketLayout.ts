export interface BracketSlot {
  matchNum: number
  row: number
  span: number
}

export interface BracketRoundConfig {
  key: string
  column: number
  slots: BracketSlot[]
}

export interface BracketHalfConfig {
  side: 'left' | 'right'
  rounds: BracketRoundConfig[]
}

export const CENTER_SLOTS = {
  hero: { row: 2, span: 5 },
  final: { row: 8, span: 2 },
  thirdPlace: { row: 12, span: 2 },
} as const
