export interface SensorReading {
  group:       string
  temperature: number
  humidity:    number
  timestamp:   string   // ISO 8601
  entryId:     number
}

export interface MonitoreoResponse {
  readings:    Record<string, SensorReading[]>  // keyed by group name (e.g. "S2A")
  lastUpdated: string | null
}
