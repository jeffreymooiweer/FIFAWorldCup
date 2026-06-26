import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import App from './App'
import { getEditionConfig } from './config/editions/registry'
import { applyTournamentTheme, getTournamentYear } from './config/tournament'
import './i18n'
import './styles/variables.css'
import './styles/poster.css'

applyTournamentTheme(getEditionConfig(getTournamentYear()).theme)

if (import.meta.env.PROD) {
  registerSW({
    immediate: true,
    onRegisteredSW(_swUrl, registration) {
      if (!registration) return
      const checkForUpdate = () => {
        registration.update().catch(() => {})
      }
      checkForUpdate()
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') checkForUpdate()
      })
    },
    onNeedRefresh() {
      window.location.reload()
    },
  })
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
