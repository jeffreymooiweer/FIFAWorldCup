import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { getEditionConfig } from './config/editions/registry'
import { applyTournamentTheme, getTournamentYear } from './config/tournament'
import './i18n'
import './styles/variables.css'
import './styles/poster.css'

applyTournamentTheme(getEditionConfig(getTournamentYear()).theme)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
