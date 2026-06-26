import type { TournamentTheme } from '../tournament'

export interface EditionHost {
  name: string
  iso: string
}

export interface EditionConfig {
  year: number
  hosts: EditionHost[]
  theme: TournamentTheme
  posterLayout: 'official-2026' | 'auto'
}
