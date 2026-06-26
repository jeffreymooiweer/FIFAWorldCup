export type AppErrorKey = 'loadFailed' | 'unknown'

export interface AppError {
  key: AppErrorKey
  params?: Record<string, string | number>
}

export class TournamentLoadError extends Error {
  readonly key: AppErrorKey
  readonly params?: Record<string, string | number>

  constructor(key: AppErrorKey, params?: Record<string, string | number>) {
    super(key)
    this.name = 'TournamentLoadError'
    this.key = key
    this.params = params
  }
}
