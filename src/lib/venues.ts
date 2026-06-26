import i18n, { getDateLocale } from '../i18n'

const GROUND_COUNTRY: Record<string, string> = {
  Atlanta: 'US',
  'Boston (Foxborough)': 'US',
  'Dallas (Arlington)': 'US',
  Houston: 'US',
  'Kansas City': 'US',
  'Los Angeles (Inglewood)': 'US',
  'Miami (Miami Gardens)': 'US',
  'New York/New Jersey (East Rutherford)': 'US',
  Philadelphia: 'US',
  'San Francisco Bay Area (Santa Clara)': 'US',
  Seattle: 'US',
  'Guadalajara (Zapopan)': 'MX',
  'Mexico City': 'MX',
  'Monterrey (Guadalupe)': 'MX',
  Toronto: 'CA',
  Vancouver: 'CA',
}

function getVenueCountryKey(ground: string): string | null {
  return GROUND_COUNTRY[ground] ?? null
}

export function formatVenueDisplay(ground: string): string {
  const countryKey = getVenueCountryKey(ground)
  if (!countryKey) return ground

  try {
    const locale = getDateLocale(i18n.language)
    const display = new Intl.DisplayNames([locale], { type: 'region' })
    const country = display.of(countryKey) ?? countryKey
    return `${ground}, ${country}`
  } catch {
    return ground
  }
}
