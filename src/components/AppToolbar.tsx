import { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { LANGUAGES } from '../locales/languages'
import type { ColorScheme } from '../lib/preferences'
import { buildShareUrl, type AppPreferences } from '../lib/preferences'
import type { ViewMode } from '../hooks/useViewMode'
import { ViewToggle } from './ViewToggle'

interface AppToolbarProps {
  prefs: AppPreferences
  year: number
  availableYears: number[]
  yearsLoading?: boolean
  showViewToggle: boolean
  viewMode: ViewMode
  onYearChange: (year: number) => void
  onLanguageChange: (lang: string | null) => void
  onColorSchemeChange: (scheme: ColorScheme) => void
  onViewModeChange: (mode: ViewMode) => void
}

export function AppToolbar({
  prefs,
  year,
  availableYears,
  yearsLoading = false,
  showViewToggle,
  viewMode,
  onYearChange,
  onLanguageChange,
  onColorSchemeChange,
  onViewModeChange,
}: AppToolbarProps) {
  const { t, i18n } = useTranslation()
  const [copied, setCopied] = useState(false)

  const handleShare = useCallback(async () => {
    const url = buildShareUrl({ ...prefs, year, viewMode })
    const shareData = {
      title: t('share.title', { year }),
      text: t('share.text', { year }),
      url,
    }
    try {
      if (navigator.share) {
        await navigator.share(shareData)
        return
      }
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') return
    }
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 3000)
    } catch {
      setCopied(true)
      window.setTimeout(() => setCopied(false), 3000)
    }
  }, [prefs, year, viewMode, t])

  const shareUrl = buildShareUrl({ ...prefs, year, viewMode })

  const handlePrint = useCallback(() => {
    window.print()
  }, [])

  return (
    <div className="app-toolbar">
      <div className="app-toolbar__row app-toolbar__row--primary">
        <label className="app-toolbar__field">
          <span className="app-toolbar__label">{t('settings.year')}</span>
          <select
            className="app-toolbar__select"
            value={year}
            onChange={(e) => onYearChange(Number(e.target.value))}
            aria-label={t('settings.year')}
            disabled={yearsLoading || availableYears.length === 0}
          >
            {availableYears.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </label>

        <label className="app-toolbar__field">
          <span className="app-toolbar__label">{t('settings.language')}</span>
          <select
            className="app-toolbar__select"
            value={prefs.language ?? i18n.language.split('-')[0]}
            onChange={(e) => onLanguageChange(e.target.value)}
            aria-label={t('settings.language')}
          >
            {LANGUAGES.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.label}
              </option>
            ))}
          </select>
        </label>

        <label className="app-toolbar__field">
          <span className="app-toolbar__label">{t('settings.colorMode')}</span>
          <select
            className="app-toolbar__select"
            value={prefs.colorScheme}
            onChange={(e) => onColorSchemeChange(e.target.value as ColorScheme)}
            aria-label={t('settings.colorMode')}
          >
            <option value="dark">{t('settings.colorDark')}</option>
            <option value="light">{t('settings.colorLight')}</option>
            <option value="system">{t('settings.colorSystem')}</option>
          </select>
        </label>

        <div className="app-toolbar__actions">
          <button
            type="button"
            className={`app-toolbar__btn${copied ? ' app-toolbar__btn--copied' : ''}`}
            onClick={handleShare}
          >
            {copied ? t('settings.copied') : t('settings.share')}
          </button>
          <button type="button" className="app-toolbar__btn" onClick={handlePrint}>
            {t('settings.print')}
          </button>
        </div>

        {copied && (
          <div className="app-toolbar__toast" role="status" aria-live="polite">
            <span className="app-toolbar__toast-label">{t('settings.copied')}</span>
            <span className="app-toolbar__toast-url">{shareUrl}</span>
          </div>
        )}
      </div>

      {showViewToggle && (
        <ViewToggle viewMode={viewMode} onChange={onViewModeChange} />
      )}
    </div>
  )
}
