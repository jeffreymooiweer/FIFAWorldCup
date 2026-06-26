/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_TOURNAMENT_YEAR?: string
  readonly VITE_TOURNAMENT_DATA_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
