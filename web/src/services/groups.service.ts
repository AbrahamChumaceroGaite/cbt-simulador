import { apiFetch } from '@/lib/api'
import type { GroupResponse, GroupInput } from '@simulador/shared'

export const groupsService = {
  getAll: () =>
    apiFetch<GroupResponse[]>('/api/groups'),

  getById: (id: string) =>
    apiFetch<GroupResponse>(`/api/groups/${id}`),

  create: (body: GroupInput) =>
    apiFetch<GroupResponse>('/api/groups', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }),

  update: (id: string, body: Partial<GroupInput>) =>
    apiFetch<GroupResponse>(`/api/groups/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }),

  delete: (id: string) =>
    apiFetch<null>(`/api/groups/${id}`, { method: 'DELETE' }),
}
