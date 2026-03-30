import { apiFetch } from '@/lib/api'
import type { SessionPayload } from '@simulador/shared'

type LoginBody = { code: string; mode: 'grupo' | 'admin'; password?: string }

export const authService = {
  me: () =>
    apiFetch<SessionPayload>('/api/auth/me'),

  login: (body: LoginBody) =>
    apiFetch<SessionPayload>('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }),

  logout: () =>
    fetch('/api/auth/logout', { method: 'POST' }),
}
