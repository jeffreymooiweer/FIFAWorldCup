/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

interface ImportMetaEnv {
  readonly VITE_TOURNAMENT_YEAR?: string
  readonly VITE_TOURNAMENT_DATA_URL?: string
  readonly VITE_FOOTBALL_DATA_TOKEN?: string
  readonly VITE_API_FOOTBALL_KEY?: string
  readonly VITE_ZAFRONIX_API_KEY?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
