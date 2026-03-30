import { apiFetch } from '@/lib/api'
import type { GroupStatResponse } from '@simulador/shared'

export const analyticsService = {
  getStats: () =>
    apiFetch<GroupStatResponse[]>('/api/analytics'),
}
