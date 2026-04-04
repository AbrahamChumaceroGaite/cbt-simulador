import { apiFetch, apiFetchFull } from '@/lib/api'
import type { EntryResponse, EntryInput } from '@simulador/shared'

export const entriesService = {
  getBySimulation: (simId: string) =>
    apiFetch<EntryResponse[]>(`/api/entries/by-simulation/${simId}`),

  save: (body: EntryInput) =>
    apiFetchFull<EntryResponse>('/api/entries', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(body),
    }),

  delete: (id: string) =>
    apiFetch<null>(`/api/entries/${id}`, { method: 'DELETE' }),
}
