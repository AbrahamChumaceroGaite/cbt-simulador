import { Injectable } from '@nestjs/common'

const LAT        = -21.5355
const LON        = -64.7296
const BASE_FORE  = 'https://api.open-meteo.com/v1/forecast'
const BASE_ARCH  = 'https://archive-api.open-meteo.com/v1/archive'
const DAILY_VARS = 'temperature_2m_mean,relative_humidity_2m_mean,daylight_duration'
const TZ         = 'America/La_Paz'
const fmt        = (d: Date) => d.toISOString().split('T')[0]

type Day = { temperature: number; humidity: number; lightHours: number; source: string }

function parseDaily(json: any, source: string): Map<string, Day> {
  const map   = new Map<string, Day>()
  const today = fmt(new Date())
  if (!json?.daily?.time) return map
  const d = json.daily
  ;(d.time as string[]).forEach((date: string, i: number) => {
    const temperature = Math.round((d.temperature_2m_mean[i] ?? 0) * 10) / 10
    const humidity    = Math.round(d.relative_humidity_2m_mean[i] ?? 65)
    const lightHours  = Math.round((d.daylight_duration[i] / 3600) * 10) / 10
    map.set(date, {
      temperature,
      humidity,
      lightHours,
      source: source === 'forecast' ? (date <= today ? 'real' : 'forecast') : source,
    })
  })
  return map
}

@Injectable()
export class ClimateService {
  async getClimate(month: number, year: number): Promise<{ days: (Day | null)[]; summary: object }> {
    const expStart = new Date(year, month - 1, 1)

    const fp = new URLSearchParams({
      latitude: String(LAT), longitude: String(LON),
      daily: DAILY_VARS, timezone: TZ,
      past_days: '92', forecast_days: '16',
    })

    const archStart = new Date(year - 1, month - 1, 1)
    const archEnd   = new Date(year - 1, month - 1 + 3, 0)
    const ap = new URLSearchParams({
      latitude: String(LAT), longitude: String(LON),
      daily: DAILY_VARS, timezone: TZ,
      start_date: fmt(archStart), end_date: fmt(archEnd),
    })

    const [fRes, aRes] = await Promise.allSettled([
      fetch(`${BASE_FORE}?${fp}`),
      fetch(`${BASE_ARCH}?${ap}`),
    ])

    const fJson = fRes.status === 'fulfilled' && fRes.value.ok ? await fRes.value.json() : null
    const aJson = aRes.status === 'fulfilled' && aRes.value.ok ? await aRes.value.json() : null

    const forecastMap = parseDaily(fJson, 'forecast')
    const archiveMap  = parseDaily(aJson, `hist${year - 1}`)

    const days: (Day | null)[] = Array.from({ length: 90 }, (_, i) => {
      const d       = new Date(expStart)
      d.setDate(d.getDate() + i)
      const dateStr = fmt(d)
      const mmdd    = dateStr.slice(5)

      if (forecastMap.has(dateStr)) return forecastMap.get(dateStr)!
      const archDate = `${year - 1}-${mmdd}`
      if (archiveMap.has(archDate)) return archiveMap.get(archDate)!
      return null
    })

    const summary = {
      real:     days.filter(d => d?.source === 'real').length,
      forecast: days.filter(d => d?.source === 'forecast').length,
      hist:     days.filter(d => d?.source?.startsWith('hist')).length,
      noData:   days.filter(d => d === null).length,
      histYear: year - 1,
    }

    return { days, summary }
  }
}
