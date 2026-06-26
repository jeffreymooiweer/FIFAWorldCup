import type { LanguageMeta } from './types'

export const LANGUAGES: LanguageMeta[] = [
  { code: 'nl', label: 'Nederlands', dateLocale: 'nl-NL', rtl: false },
  { code: 'en', label: 'English', dateLocale: 'en-US', rtl: false },
  { code: 'de', label: 'Deutsch', dateLocale: 'de-DE', rtl: false },
  { code: 'fr', label: 'Français', dateLocale: 'fr-FR', rtl: false },
  { code: 'es', label: 'Español', dateLocale: 'es-ES', rtl: false },
  { code: 'pt', label: 'Português', dateLocale: 'pt-PT', rtl: false },
  { code: 'it', label: 'Italiano', dateLocale: 'it-IT', rtl: false },
  { code: 'pl', label: 'Polski', dateLocale: 'pl-PL', rtl: false },
  { code: 'tr', label: 'Türkçe', dateLocale: 'tr-TR', rtl: false },
  { code: 'ar', label: 'العربية', dateLocale: 'ar-SA', rtl: true },
  { code: 'ja', label: '日本語', dateLocale: 'ja-JP', rtl: false },
  { code: 'ko', label: '한국어', dateLocale: 'ko-KR', rtl: false },
  { code: 'zh', label: '中文', dateLocale: 'zh-CN', rtl: false },
  { code: 'ru', label: 'Русский', dateLocale: 'ru-RU', rtl: false },
  { code: 'uk', label: 'Українська', dateLocale: 'uk-UA', rtl: false },
  { code: 'sv', label: 'Svenska', dateLocale: 'sv-SE', rtl: false },
  { code: 'da', label: 'Dansk', dateLocale: 'da-DK', rtl: false },
  { code: 'nb', label: 'Norsk', dateLocale: 'nb-NO', rtl: false },
  { code: 'cs', label: 'Čeština', dateLocale: 'cs-CZ', rtl: false },
  { code: 'ro', label: 'Română', dateLocale: 'ro-RO', rtl: false },
  { code: 'hu', label: 'Magyar', dateLocale: 'hu-HU', rtl: false },
  { code: 'id', label: 'Bahasa Indonesia', dateLocale: 'id-ID', rtl: false },
  { code: 'hi', label: 'हिन्दी', dateLocale: 'hi-IN', rtl: false },
  { code: 'he', label: 'עברית', dateLocale: 'he-IL', rtl: true },
  { code: 'el', label: 'Ελληνικά', dateLocale: 'el-GR', rtl: false },
  { code: 'fi', label: 'Suomi', dateLocale: 'fi-FI', rtl: false },
  { code: 'hr', label: 'Hrvatski', dateLocale: 'hr-HR', rtl: false },
  { code: 'bg', label: 'Български', dateLocale: 'bg-BG', rtl: false },
  { code: 'th', label: 'ไทย', dateLocale: 'th-TH', rtl: false },
  { code: 'vi', label: 'Tiếng Việt', dateLocale: 'vi-VN', rtl: false },
  { code: 'sk', label: 'Slovenčina', dateLocale: 'sk-SK', rtl: false },
  { code: 'sl', label: 'Slovenščina', dateLocale: 'sl-SI', rtl: false },
  { code: 'sr', label: 'Српски', dateLocale: 'sr-RS', rtl: false },
  { code: 'ca', label: 'Català', dateLocale: 'ca-ES', rtl: false },
  { code: 'fa', label: 'فارسی', dateLocale: 'fa-IR', rtl: true },
  { code: 'ms', label: 'Bahasa Melayu', dateLocale: 'ms-MY', rtl: false },
  { code: 'af', label: 'Afrikaans', dateLocale: 'af-ZA', rtl: false },
  { code: 'sw', label: 'Kiswahili', dateLocale: 'sw-KE', rtl: false },
  { code: 'et', label: 'Eesti', dateLocale: 'et-EE', rtl: false },
  { code: 'lv', label: 'Latviešu', dateLocale: 'lv-LV', rtl: false },
  { code: 'lt', label: 'Lietuvių', dateLocale: 'lt-LT', rtl: false },
  { code: 'is', label: 'Íslenska', dateLocale: 'is-IS', rtl: false },
  { code: 'sq', label: 'Shqip', dateLocale: 'sq-AL', rtl: false },
  { code: 'bn', label: 'বাংলা', dateLocale: 'bn-BD', rtl: false },
  { code: 'ur', label: 'اردو', dateLocale: 'ur-PK', rtl: true },
]

export const SUPPORTED_LANGUAGES = LANGUAGES.map((l) => l.code)

export const DATE_LOCALES: Record<string, string> = Object.fromEntries(
  LANGUAGES.map((l) => [l.code, l.dateLocale]),
)

export const RTL_LANGUAGES = new Set(LANGUAGES.filter((l) => l.rtl).map((l) => l.code))
