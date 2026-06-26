import { getTournamentYear } from '../config/tournament'
import {
  getMaxSelectableYear,
  isFutureWorldCupYear,
  isWorldCupYear,
} from './worldCupYears'

export type ViewMode = 'poster' | 'list'

const STORAGE_KEYS = {
  year: 'wk-year',
  viewMode: 'wk-view-mode',
} as const

export interface AppPreferences {
  year: number
  viewMode: ViewMode | null
  group: string | null
  matchNum: number | null
}

function parseYear(value: string | null): number | null {
  if (!value) return null
  const year = Number(value)
  if (!Number.isFinite(year)) return null
  if (!isWorldCupYear(year)) return null
  if (isFutureWorldCupYear(year)) return null
  return year
}

export function clampYear(year: number, availableYears: number[]): number {
  if (availableYears.includes(year)) return year
  const max = getMaxSelectableYear()
  if (availableYears.includes(max)) return max
  return availableYears[0] ?? getTournamentYear()
}

function parseViewMode(value: string | null): ViewMode | null {
  if (value === 'poster' || value === 'list') return value
  return null
}

function parseGroup(value: string | null): string | null {
  if (!value) return null
  const g = value.toUpperCase()
  return /^[A-Z]$/.test(g) ? g : null
}

function parseMatchNum(value: string | null): number | null {
  if (!value) return null
  const n = Number(value)
  return Number.isFinite(n) && n > 0 ? n : null
}

export function readPreferencesFromUrl(): Partial<AppPreferences> {
  const params = new URLSearchParams(window.location.search)
  return {
    year: parseYear(params.get('year')) ?? undefined,
    viewMode: parseViewMode(params.get('view')) ?? undefined,
    group: parseGroup(params.get('groep') ?? params.get('group')),
    matchNum: parseMatchNum(params.get('wedstrijd') ?? params.get('match')),
  }
}

export function readPreferencesFromStorage(): Partial<AppPreferences> {
  return {
    year: parseYear(localStorage.getItem(STORAGE_KEYS.year)) ?? undefined,
    viewMode: parseViewMode(localStorage.getItem(STORAGE_KEYS.viewMode)) ?? undefined,
  }
}

export function resolveInitialPreferences(): AppPreferences {
  const fromUrl = readPreferencesFromUrl()
  const fromStorage = readPreferencesFromStorage()
  const envYear = getTournamentYear()

  return {
    year: fromUrl.year ?? fromStorage.year ?? envYear,
    viewMode: fromUrl.viewMode ?? fromStorage.viewMode ?? null,
    group: fromUrl.group ?? null,
    matchNum: fromUrl.matchNum ?? null,
  }
}

export function writePreferencesToUrl(prefs: AppPreferences): void {
  const params = new URLSearchParams()
  const defaultYear = getTournamentYear()
  if (prefs.year !== defaultYear) params.set('year', String(prefs.year))
  if (prefs.viewMode) params.set('view', prefs.viewMode)
  if (prefs.group) params.set('groep', prefs.group)
  if (prefs.matchNum) params.set('wedstrijd', String(prefs.matchNum))

  const query = params.toString()
  const base = import.meta.env.BASE_URL.replace(/\/$/, '')
  const path = window.location.pathname.replace(/\/$/, '') || base || '/'
  const url = query ? `${path}?${query}` : path
  window.history.replaceState(null, '', url)
}

export function persistPreferences(prefs: AppPreferences): void {
  localStorage.setItem(STORAGE_KEYS.year, String(prefs.year))
  if (prefs.viewMode) {
    localStorage.setItem(STORAGE_KEYS.viewMode, prefs.viewMode)
  }
}
