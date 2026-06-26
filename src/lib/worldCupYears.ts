import { getTournamentYear } from '../config/tournament'

const CANCELLED_YEARS = new Set([1942, 1946])

export function isWorldCupYear(year: number): boolean {
  if (year < 1930 || year > 2100) return false
  if (CANCELLED_YEARS.has(year)) return false
  return (year - 1930) % 4 === 0
}

function listWorldCupYears(): number[] {
  const years: number[] = []
  for (let year = 1930; year <= 2100; year += 4) {
    if (!CANCELLED_YEARS.has(year)) years.push(year)
  }
  return years
}

/** Hoogste selecteerbare editie — de geconfigureerde huidige editie, geen toekomst. */
export function getMaxSelectableYear(): number {
  return getTournamentYear()
}

export function isFutureWorldCupYear(year: number): boolean {
  return year > getMaxSelectableYear()
}

export function listPastWorldCupYears(): number[] {
  const max = getMaxSelectableYear()
  return listWorldCupYears().filter((year) => year < max)
}
