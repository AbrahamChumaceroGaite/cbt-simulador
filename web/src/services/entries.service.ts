import { apiFetch } from '@/lib/api'
import type { EntryResponse, EntryInput } from '@simulador/shared'

export const entriesService = {
  getBySimulation: (simId: string) =>
    apiFetch<EntryResponse[]>(`/api/entries/by-simulation/${simId}`),

  save: (body: EntryInput) =>
    apiFetch<EntryResponse>('/api/entries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }),
}
