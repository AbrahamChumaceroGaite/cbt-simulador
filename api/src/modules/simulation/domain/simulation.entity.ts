export interface SimulationEntity {
  id:                 string
  groupId:            string
  name:               string
  description:        string
  plantName:          string
  isDemo:             boolean
  isLocked:           boolean
  initialHeight:      number
  baseGrowth:         number
  optimalTemp:        number
  optimalHumidity:    number
  optimalLight:       number
  officialPrediction: number | null
  predictionNote:     string
  startMonth:         number
  startYear:          number
  startDay:           number
  projDays:           number
  createdAt:          Date
  updatedAt:          Date
  group?:             { id: string; name: string; plant: string }
  entries?:           EntrySubset[]
  _count?:            { entries: number }
}

export interface EntrySubset {
  id: string; sessionNum: number; realHeight: number | null
}
