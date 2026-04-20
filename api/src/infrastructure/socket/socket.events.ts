export const WS_EVENTS = {
  ENTRY_SAVED:         'entry:saved',
  SIMULATION_UPDATED:  'simulation:updated',
  MONITOREO_UPDATE:    'monitoreo:update',
} as const

export type WsEvent = typeof WS_EVENTS[keyof typeof WS_EVENTS]
