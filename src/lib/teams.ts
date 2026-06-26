import i18n, { getDateLocale } from '../i18n'

const TEAM_ISO: Record<string, string> = {
  Algeria: 'dz',
  Argentina: 'ar',
  Australia: 'au',
  Austria: 'at',
  Belgium: 'be',
  'Bosnia & Herzegovina': 'ba',
  Brazil: 'br',
  Canada: 'ca',
  'Cape Verde': 'cv',
  Colombia: 'co',
  Croatia: 'hr',
  Curaçao: 'cw',
  'Czech Republic': 'cz',
  'DR Congo': 'cd',
  Ecuador: 'ec',
  Egypt: 'eg',
  England: 'gb-eng',
  France: 'fr',
  Germany: 'de',
  Ghana: 'gh',
  Haiti: 'ht',
  Iran: 'ir',
  Iraq: 'iq',
  'Ivory Coast': 'ci',
  Japan: 'jp',
  Jordan: 'jo',
  Mexico: 'mx',
  Morocco: 'ma',
  Netherlands: 'nl',
  'New Zealand': 'nz',
  Norway: 'no',
  Panama: 'pa',
  Paraguay: 'py',
  Portugal: 'pt',
  Qatar: 'qa',
  'Saudi Arabia': 'sa',
  Scotland: 'gb-sct',
  Senegal: 'sn',
  'South Africa': 'za',
  'South Korea': 'kr',
  Spain: 'es',
  Sweden: 'se',
  Switzerland: 'ch',
  Tunisia: 'tn',
  Turkey: 'tr',
  USA: 'us',
  Uruguay: 'uy',
  Uzbekistan: 'uz',
}

const SUPPORTED_FLAG_WIDTHS = [20, 40, 80, 160, 320, 640, 1280] as const

function getSupportedFlagWidth(requested: number): number {
  return SUPPORTED_FLAG_WIDTHS.find((width) => width >= requested) ?? 1280
}

function getRegionCode(iso: string): string {
  return iso.split('-')[0].toUpperCase()
}

export function getTeamIso(team: string): string | null {
  return TEAM_ISO[team] ?? null
}

export function getTeamDisplayName(team: string): string {
  if (i18n.exists(team, { ns: 'teams' })) {
    return i18n.t(team, { ns: 'teams' })
  }

  const iso = getTeamIso(team)
  if (!iso) return team

  try {
    const locale = getDateLocale(i18n.language)
    const display = new Intl.DisplayNames([locale], { type: 'region' })
    const name = display.of(getRegionCode(iso))
    if (name) return name
  } catch {
    // fall through to API key
  }

  return team
}

export function getFlagUrl(team: string, width = 40): string | null {
  const iso = getTeamIso(team)
  if (!iso) return null
  const supportedWidth = getSupportedFlagWidth(width)
  return `https://flagcdn.com/w${supportedWidth}/${iso}.png`
}
