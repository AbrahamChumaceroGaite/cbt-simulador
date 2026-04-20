import type { SensorReading } from '@simulador/shared'

export const WS = {
  ENTRY_SAVED:        'entry:saved',
  SIMULATION_UPDATED: 'simulation:updated',
  MONITOREO_UPDATE:   'monitoreo:update',
} as const

export type WsEvent = typeof WS[keyof typeof WS]

export interface WsPayloads {
  'entry:saved':        { simulationId: string; groupId: string; sessionNum: number; realHeight: number | null }
  'simulation:updated': { simulationId: string; isLocked?: boolean }
  'monitoreo:update':   { reading: SensorReading }
}
