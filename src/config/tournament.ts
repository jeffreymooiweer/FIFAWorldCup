export interface TournamentTheme {
  bgDeep: string
  bgGlow: string
  bgBody: string
  viewportGradientInner: string
  viewportGradientMid: string
  viewportGradientOuter: string
  posterGradientGlow: string
  posterGradientTop: string
  posterGradientBottom: string
  accentOrange: string
  accentBlue: string
}

const OPENFOOTBALL_BASE =
  'https://raw.githubusercontent.com/openfootball/worldcup.json/master'

/** Hand-tuned palette for the active edition. */
const EDITION_THEMES: Record<number, TournamentTheme> = {
  2026: {
    bgDeep: '#0b1a3a',
    bgGlow: '#1a4a8a',
    bgBody: '#060e1f',
    viewportGradientInner: '#12356b',
    viewportGradientMid: '#060e1f',
    viewportGradientOuter: '#030810',
    posterGradientGlow: 'rgba(40, 120, 220, 0.35)',
    posterGradientTop: '#0d2248',
    posterGradientBottom: '#081530',
    accentOrange: '#ff6600',
    accentBlue: '#21468b',
  },
}

function hslToHex(h: number, s: number, l: number): string {
  const a = s * Math.min(l, 1 - l)
  const f = (n: number) => {
    const k = (n + h / 30) % 12
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1)
    return Math.round(255 * color)
      .toString(16)
      .padStart(2, '0')
  }
  return `#${f(0)}${f(8)}${f(4)}`
}

function generateThemeForYear(year: number): TournamentTheme {
  const cycle = Math.floor((year - 2026) / 4)
  const hue = (210 + cycle * 67) % 360
  const deep = hslToHex(hue, 0.55, 0.14)
  const glow = hslToHex(hue, 0.5, 0.32)
  const body = hslToHex(hue, 0.45, 0.06)
  const inner = hslToHex(hue, 0.45, 0.28)
  const mid = hslToHex(hue, 0.4, 0.1)
  const outer = hslToHex(hue, 0.35, 0.04)
  const accentHue = (hue + 150) % 360

  return {
    bgDeep: deep,
    bgGlow: glow,
    bgBody: body,
    viewportGradientInner: inner,
    viewportGradientMid: mid,
    viewportGradientOuter: outer,
    posterGradientGlow: `hsla(${hue}, 60%, 50%, 0.35)`,
    posterGradientTop: hslToHex(hue, 0.5, 0.18),
    posterGradientBottom: hslToHex(hue, 0.45, 0.1),
    accentOrange: hslToHex(accentHue, 0.85, 0.52),
    accentBlue: hslToHex(hue, 0.55, 0.35),
  }
}

export function getThemeForYear(year: number): TournamentTheme {
  return EDITION_THEMES[year] ?? generateThemeForYear(year)
}

export function getTournamentYear(): number {
  const raw = import.meta.env.VITE_TOURNAMENT_YEAR
  const parsed = Number(raw)
  if (Number.isFinite(parsed) && parsed >= 1930) return Math.floor(parsed)
  return 2026
}

export function getWorldCupDataUrl(year: number): string {
  const custom = import.meta.env.VITE_TOURNAMENT_DATA_URL
  if (custom) return custom
  return `${OPENFOOTBALL_BASE}/${year}/worldcup.json`
}

export function applyTournamentTheme(theme: TournamentTheme): void {
  const root = document.documentElement
  root.style.setProperty('--bg-deep', theme.bgDeep)
  root.style.setProperty('--bg-glow', theme.bgGlow)
  root.style.setProperty('--theme-bg-body', theme.bgBody)
  root.style.setProperty('--theme-viewport-inner', theme.viewportGradientInner)
  root.style.setProperty('--theme-viewport-mid', theme.viewportGradientMid)
  root.style.setProperty('--theme-viewport-outer', theme.viewportGradientOuter)
  root.style.setProperty('--theme-poster-glow', theme.posterGradientGlow)
  root.style.setProperty('--theme-poster-top', theme.posterGradientTop)
  root.style.setProperty('--theme-poster-bottom', theme.posterGradientBottom)
  root.style.setProperty('--orange', theme.accentOrange)
  root.style.setProperty('--blue', theme.accentBlue)
  root.style.setProperty('--winner', theme.accentOrange)
}
