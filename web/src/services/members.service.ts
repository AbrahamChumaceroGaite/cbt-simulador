import { apiFetch, apiFetchFull } from '@/lib/api'
import type { MemberResponse, MemberInput } from '@simulador/shared'

export const membersService = {
  getByGroup: (groupId: string) =>
    apiFetch<MemberResponse[]>(`/api/members/by-group/${groupId}`),

  create: (body: MemberInput & { groupId: string }) =>
    apiFetchFull<MemberResponse>('/api/members', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(body),
    }),

  update: (id: string, body: Partial<MemberInput>) =>
    apiFetchFull<MemberResponse>(`/api/members/${id}`, {
      method:  'PUT',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(body),
    }),

  delete: (id: string) =>
    apiFetch<null>(`/api/members/${id}`, { method: 'DELETE' }),
}
