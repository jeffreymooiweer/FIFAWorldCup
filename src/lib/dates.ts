import i18n, { getDateLocale } from '../i18n'

function parseUtcOffset(time: string): number {
  const match = time.match(/UTC([+-]?\d+)/)
  if (!match) return 0
  return Number(match[1])
}

export function parseMatchDateTime(date: string, time: string): Date {
  const [hours, minutes] = time.split(' ')[0].split(':').map(Number)
  const offsetHours = parseUtcOffset(time)
  const utcMs = Date.UTC(
    Number(date.slice(0, 4)),
    Number(date.slice(5, 7)) - 1,
    Number(date.slice(8, 10)),
    hours - offsetHours,
    minutes,
  )
  return new Date(utcMs)
}

export function formatMatchDateTime(date: string, time: string): string {
  const dt = parseMatchDateTime(date, time)
  const locale = getDateLocale(i18n.language)
  const formatter = new Intl.DateTimeFormat(locale, {
    timeZone: 'Europe/Amsterdam',
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })

  const parts = formatter.formatToParts(dt)
  const weekday = parts.find((p) => p.type === 'weekday')?.value ?? ''
  const day = parts.find((p) => p.type === 'day')?.value ?? ''
  const month = parts.find((p) => p.type === 'month')?.value ?? ''
  const year = parts.find((p) => p.type === 'year')?.value ?? ''
  const hour = parts.find((p) => p.type === 'hour')?.value ?? '00'
  const minute = parts.find((p) => p.type === 'minute')?.value ?? '00'
  const timeSuffix = i18n.t('match.timeSuffix')

  if (locale.startsWith('nl')) {
    return `${weekday.toUpperCase()} ${day} ${month.toUpperCase()} ${year} - ${hour}:${minute}${timeSuffix}`
  }

  return `${weekday.toUpperCase()} ${day} ${month.toUpperCase()} ${year} - ${hour}:${minute}${timeSuffix}`
}

export function formatLastUpdated(date: Date): string {
  return new Intl.DateTimeFormat(getDateLocale(i18n.language), {
    timeZone: 'Europe/Amsterdam',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

export function formatShortDate(date: string): string {
  const [year, month, day] = date.split('-').map(Number)
  const dt = new Date(year, month - 1, day)
  return new Intl.DateTimeFormat(getDateLocale(i18n.language), {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  }).format(dt)
}
