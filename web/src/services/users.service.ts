import { apiFetch, apiFetchFull } from '@/lib/api'
import type { UserResponse, CreateUserDto, UpdateUserDto } from '@simulador/shared'

export const usersService = {
  getAll: () =>
    apiFetch<UserResponse[]>('/api/usuarios'),

  create: (dto: CreateUserDto) =>
    apiFetchFull<UserResponse>('/api/usuarios', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(dto),
    }),

  update: (id: string, dto: UpdateUserDto) =>
    apiFetchFull<UserResponse>(`/api/usuarios/${id}`, {
      method:  'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(dto),
    }),

  remove: (id: string) =>
    apiFetch<null>(`/api/usuarios/${id}`, { method: 'DELETE' }),
}
