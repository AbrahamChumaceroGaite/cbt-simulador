import { apiFetch }            from '@/lib/api'
import type { MonitoreoResponse } from '@simulador/shared'

export const monitoreoService = {
  get: () => apiFetch<MonitoreoResponse>('/api/monitoreo'),
}
