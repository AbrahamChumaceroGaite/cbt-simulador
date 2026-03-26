// ── Growth model ─────────────────────────────────────────────────────────────
export interface GrowthParams {
  initialHeight: number
  baseGrowth: number
  optimalTemp: number
  optimalHumidity: number
  optimalLight: number
}

export interface DayConditions {
  temperature: number
  humidity: number
  lightHours: number
}

// ── Simulation domain ─────────────────────────────────────────────────────────
export type ClimateDay = {
  temperature: number
  humidity: number
  lightHours: number
  source: string
} | null

export type ClimateSummary = {
  real: number
  forecast: number
  hist: number
  noData: number
  histYear: number
}

export type Entry = {
  id: string
  sessionNum: number
  date: string
  myPrediction: number | null
  realHeight: number | null
  temperature: number | null
  humidity: number | null
  lightHours: number | null
  note: string
}

export type Sim = {
  id: string
  name: string
  description: string
  plantName: string
  isDemo: boolean
  isLocked: boolean
  initialHeight: number
  baseGrowth: number
  optimalTemp: number
  optimalHumidity: number
  optimalLight: number
  officialPrediction: number | null
  predictionNote: string
  startMonth: number
  startYear: number
  startDay: number
  projDays: number
  entries: Entry[]
  group: { id: string; name: string; plant: string }
}

export type Tab = 'planta' | 'modelo' | 'diario' | 'prediccion' | 'ayuda'

/** Unified projection point — height is null when climate data is missing for that day */
export type ProjPoint = { day: number; height: number | null; hasData: boolean }
