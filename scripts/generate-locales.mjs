import { mkdirSync, writeFileSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { UI_TRANSLATIONS } from './locale-data/ui.mjs'
import { teamsJsonFor } from './locale-data/teams-manual.mjs'
import { UI_EXTRAS, UI_EXTRAS_NL } from './locale-data/ui-extras.mjs'

const LANGUAGE_CODES = Object.keys(UI_TRANSLATIONS)

function mergeExtras(code, translation) {
  const extras = code === 'nl' ? UI_EXTRAS_NL : UI_EXTRAS
  return { ...translation, ...extras }
}

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const localesDir = join(root, 'src', 'locales')

const nlTeams = JSON.parse(readFileSync(join(localesDir, 'nl', 'teams.json'), 'utf8'))

for (const code of LANGUAGE_CODES) {
  const dir = join(localesDir, code)
  mkdirSync(dir, { recursive: true })

  const translation = UI_TRANSLATIONS[code]
  if (!translation) {
    console.warn(`Missing UI translation for: ${code}`)
    continue
  }

  writeFileSync(join(dir, 'translation.json'), `${JSON.stringify(mergeExtras(code, translation), null, 2)}\n`)

  const teams = code === 'nl' ? nlTeams : teamsJsonFor(code)
  writeFileSync(join(dir, 'teams.json'), `${JSON.stringify(teams, null, 2)}\n`)
}

console.log(`Generated locale files for ${LANGUAGE_CODES.length} languages.`)
