import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import { resolveInitialLanguage } from '../lib/preferences'
import { DATE_LOCALES, RTL_LANGUAGES, SUPPORTED_LANGUAGES } from '../locales/languages'

const translationModules = import.meta.glob('../locales/*/translation.json', {
  eager: true,
}) as Record<string, { default: Record<string, unknown> }>

const teamModules = import.meta.glob('../locales/*/teams.json', {
  eager: true,
}) as Record<string, { default: Record<string, string> }>

function langFromPath(path: string): string | null {
  const match = path.match(/locales\/([^/]+)\//)
  return match?.[1] ?? null
}

function buildResources() {
  const resources: Record<
    string,
    { translation: Record<string, unknown>; teams: Record<string, string> }
  > = {}

  for (const path of Object.keys(translationModules)) {
    const lang = langFromPath(path)
    if (!lang) continue

    const teamsPath = `../locales/${lang}/teams.json`
    resources[lang] = {
      translation: translationModules[path].default,
      teams: teamModules[teamsPath]?.default ?? {},
    }
  }

  return resources
}

function syncDocumentLanguage(language: string) {
  const lang = language.split('-')[0]
  document.documentElement.lang = lang
  document.documentElement.dir = RTL_LANGUAGES.has(lang) ? 'rtl' : 'ltr'
}

i18n.use(initReactI18next).init({
  resources: buildResources(),
  lng: resolveInitialLanguage(),
  supportedLngs: [...SUPPORTED_LANGUAGES],
  fallbackLng: 'en',
  defaultNS: 'translation',
  ns: ['translation', 'teams'],
  interpolation: { escapeValue: false },
})

i18n.on('languageChanged', syncDocumentLanguage)
syncDocumentLanguage(i18n.language)

export default i18n

export function getDateLocale(language: string): string {
  const base = language.split('-')[0]
  return DATE_LOCALES[base] ?? DATE_LOCALES.en ?? 'en-US'
}
