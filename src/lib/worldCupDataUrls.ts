import { getWorldCupDataUrl } from '../config/tournament'

export function getBundledWorldCupUrl(year: number): string {
  const base = import.meta.env.BASE_URL
  return `${base}data/worldcup-${year}.json`
}

export function getLiveWorldCupUrl(year: number): string {
  return getWorldCupDataUrl(year)
}
