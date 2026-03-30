export interface EntryEntity {
  id:           string
  simulationId: string
  sessionNum:   number
  date:         Date
  myPrediction: number | null
  realHeight:   number | null
  temperature:  number | null
  humidity:     number | null
  lightHours:   number | null
  note:         string
  createdAt:    Date
  updatedAt:    Date
}
