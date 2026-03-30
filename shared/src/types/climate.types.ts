export type ClimateDay = {
  temperature: number
  humidity:    number
  lightHours:  number
  source:      string
} | null

export type ClimateSummary = {
  real:     number
  forecast: number
  hist:     number
  noData:   number
  histYear: number
}

export type ClimateResponse = {
  days:    ClimateDay[]
  summary: ClimateSummary
}

export type WeatherDay = {
  date:          string
  temperature:   number
  humidity:      number
  lightHours:    number
  precipitation: number
}
