import { apiFetchFull } from '@/lib/api'
import type { RestoreResult } from '@simulador/shared'

export const backupService = {
  download: (sections?: string[]) => {
    const qs = sections?.length ? `?sections=${sections.join(',')}` : ''
    return fetch(`/api/backup${qs}`)
  },

  restore: (body: object) =>
    apiFetchFull<RestoreResult>('/api/backup/restore', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(body),
    }),
}
