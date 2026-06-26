import { useTranslation } from 'react-i18next'
import type { EditionHost } from '../config/editions/types'
import { getFlagUrl } from '../lib/teams'

interface HostFlagsProps {
  hosts: EditionHost[]
}

export function HostFlags({ hosts }: HostFlagsProps) {
  const { t } = useTranslation()
  if (hosts.length === 0) return null

  return (
    <div className="host-flags" aria-label={t('hosts.label')}>
      <span className="host-flags__label">{t('hosts.label')}:</span>
      {hosts.map((host) => {
        const flag = getFlagUrl(host.name === 'USA' ? 'USA' : host.name, 40)
        return (
          <span key={host.iso} className="host-flags__item" title={host.name}>
            {flag && <img className="host-flags__flag" src={flag} alt="" />}
          </span>
        )
      })}
    </div>
  )
}
