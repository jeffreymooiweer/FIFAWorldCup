import type { EditionConfig } from './types'
import { getThemeForYear } from '../tournament'

const EDITION_2026: EditionConfig = {
  year: 2026,
  hosts: [
    { name: 'USA', iso: 'us' },
    { name: 'Mexico', iso: 'mx' },
    { name: 'Canada', iso: 'ca' },
  ],
  theme: getThemeForYear(2026),
  posterLayout: 'official-2026',
}

const EDITION_2022: EditionConfig = {
  year: 2022,
  hosts: [{ name: 'Qatar', iso: 'qa' }],
  theme: getThemeForYear(2022),
  posterLayout: 'auto',
}

const EDITION_2018: EditionConfig = {
  year: 2018,
  hosts: [{ name: 'Russia', iso: 'ru' }],
  theme: getThemeForYear(2018),
  posterLayout: 'auto',
}

const EDITION_REGISTRY: Record<number, EditionConfig> = {
  2018: EDITION_2018,
  2022: EDITION_2022,
  2026: EDITION_2026,
}

export function getEditionConfig(year: number): EditionConfig {
  if (EDITION_REGISTRY[year]) return EDITION_REGISTRY[year]
  return {
    year,
    hosts: [],
    theme: getThemeForYear(year),
    posterLayout: 'auto',
  }
}
