export const WS = {
  ENTRY_SAVED:        'entry:saved',
  SIMULATION_UPDATED: 'simulation:updated',
} as const

export type WsEvent = typeof WS[keyof typeof WS]

export interface WsPayloads {
  'entry:saved':        { simulationId: string; groupId: string; sessionNum: number; realHeight: number | null }
  'simulation:updated': { simulationId: string; isLocked?: boolean }
}
