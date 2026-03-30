import { apiFetch } from '@/lib/api'
import type { ClimateResponse } from '@simulador/shared'

export const climateService = {
  get: (month: number, year: number) =>
    apiFetch<ClimateResponse>(`/api/climate?month=${month}&year=${year}`),
}
