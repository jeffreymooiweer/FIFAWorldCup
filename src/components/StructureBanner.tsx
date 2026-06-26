import { useTranslation } from 'react-i18next'

interface StructureBannerProps {
  warnings: string[]
}

export function StructureBanner({ warnings }: StructureBannerProps) {
  const { t } = useTranslation()
  if (warnings.length === 0) return null

  return (
    <div className="structure-banner" role="alert">
      <p className="structure-banner__title">{t('meta.structureWarning')}</p>
      <ul className="structure-banner__list">
        {warnings.map((key) => (
          <li key={key}>{t(`meta.${key}`, { defaultValue: key })}</li>
        ))}
      </ul>
    </div>
  )
}
