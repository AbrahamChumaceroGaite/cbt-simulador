import type { EntryResponse } from './entry.types'

export type SimulationResponse = {
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
  createdAt:          string
  group?:             { id: string; name: string; plant: string }
  entries?:           EntryResponse[]
  _count?:            { entries: number }
}

export type SimulationInput = {
  groupId:         string
  name:            string
  description?:    string
  plantName?:      string
  initialHeight?:  number
  baseGrowth?:     number
  optimalTemp?:    number
  optimalHumidity?: number
  optimalLight?:   number
}

export type SimulationUpdateInput = {
  name?:               string
  description?:        string
  plantName?:          string
  isLocked?:           boolean
  initialHeight?:      number
  baseGrowth?:         number
  optimalTemp?:        number
  optimalHumidity?:    number
  optimalLight?:       number
  officialPrediction?: number | null
  predictionNote?:     string
  startMonth?:         number
  startYear?:          number
  startDay?:           number
  projDays?:           number
}
