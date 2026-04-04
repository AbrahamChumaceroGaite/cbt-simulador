import { apiFetch } from '@/lib/api'
import type { SimulationResponse, SimulationInput, SimulationUpdateInput } from '@simulador/shared'

export const simulationsService = {
  getAll: (groupId?: string) =>
    apiFetch<SimulationResponse[]>(groupId ? `/api/simulations?groupId=${groupId}` : '/api/simulations'),

  getById: (id: string) =>
    apiFetch<SimulationResponse>(`/api/simulations/${id}`),

  create: (body: SimulationInput) =>
    apiFetch<SimulationResponse>('/api/simulations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }),

  update: (id: string, body: SimulationUpdateInput) =>
    apiFetch<SimulationResponse>(`/api/simulations/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }),

  delete: (id: string) =>
    apiFetch<null>(`/api/simulations/${id}`, { method: 'DELETE' }),
}
