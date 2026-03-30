import { apiFetch } from '@/lib/api'
import type { EntryResponse, EntryInput } from '@simulador/shared'

export const entriesService = {
  save: (body: EntryInput) =>
    apiFetch<EntryResponse>('/api/entries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }),
}
