import type { SimulationResponse, EntryResponse } from '@simulador/shared'

// Re-export shared types used by simulation features
export type { ClimateDay, ClimateSummary, GrowthParams, DayConditions, ProjPoint } from '@simulador/shared'

// UI-only type
export type Tab = 'planta' | 'modelo' | 'diario' | 'prediccion' | 'ayuda'

// Refined simulation types — required fields guaranteed by the simulation detail endpoint
export type Entry = EntryResponse

export type Sim = SimulationResponse & {
  entries: EntryResponse[]
  group: { id: string; name: string; plant: string }
}
