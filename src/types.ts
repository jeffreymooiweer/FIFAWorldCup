export interface RawScore {
  ft: [number, number]
  ht?: [number, number]
}

export interface RawMatch {
  round: string
  num?: number
  date: string
  time: string
  team1: string
  team2: string
  score?: RawScore
  group?: string
  ground?: string
}

export interface WorldCupData {
  name: string
  matches: RawMatch[]
}

export interface Match {
  num: number | null
  round: string
  date: string
  time: string
  team1: string
  team2: string
  score: [number, number] | null
  group: string | null
  ground: string | null
  played: boolean
}

export interface ResolvedMatch extends Match {
  resolvedTeam1: string
  resolvedTeam2: string
  winner: string | null
  isPlaceholder1: boolean
  isPlaceholder2: boolean
}

export interface GroupStanding {
  group: string
  position: number
  team: string
  played: number
  won: number
  drawn: number
  lost: number
  goalsFor: number
  goalsAgainst: number
  goalDiff: number
  points: number
}
