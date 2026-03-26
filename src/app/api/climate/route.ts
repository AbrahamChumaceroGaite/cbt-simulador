import { NextResponse, NextRequest } from 'next/server'

export const dynamic = 'force-dynamic'

const LAT = -21.5355
const LON = -64.7296
const BASE_FORECAST = 'https://api.open-meteo.com/v1/forecast'
const BASE_ARCHIVE  = 'https://archive-api.open-meteo.com/v1/archive'
const DAILY_VARS    = 'temperature_2m_mean,relative_humidity_2m_mean,daylight_duration'
const TZ            = 'America/La_Paz'

const fmt = (d: Date) => d.toISOString().split('T')[0]

type Day = { temperature: number; humidity: number; lightHours: number; source: string }

function parseDaily(json: any, source: string): Map<string, Day> {
  const map = new Map<string, Day>()
  const today = fmt(new Date())
  if (!json?.daily?.time) return map
  const d = json.daily
  ;(d.time as string[]).forEach((date: string, i: number) => {
    const temperature = Math.round((d.temperature_2m_mean[i] ?? 0) * 10) / 10
    const humidity    = Math.round(d.relative_humidity_2m_mean[i] ?? 65)
    const lightHours  = Math.round((d.daylight_duration[i] / 3600) * 10) / 10
    map.set(date, { temperature, humidity, lightHours, source: source === 'forecast' ? (date <= today ? 'real' : 'forecast') : source })
  })
  return map
}

/**
 * Datos diarios reales de Tarija combinando:
 *   1. Open-Meteo forecast (past 92d + next 16d) → datos reales del año actual + pronóstico
 *   2. Open-Meteo archive del año pasado (mismas fechas) → fallback con variación diaria real
 *
 * NUNCA usa promedios mensuales planos. Si un día no tiene dato de ninguna fuente,
 * se marca como null para que la UI lo indique claramente.
 *
 * GET /api/climate?month=4&year=2026
 */
export async function GET(req: NextRequest) {
  const month = Math.max(1, Math.min(12, parseInt(req.nextUrl.searchParams.get('month') ?? '4')))
  const year  = parseInt(req.nextUrl.searchParams.get('year') ?? String(new Date().getFullYear()))

  const expStart = new Date(year, month - 1, 1)

  try {
    // ── Fetch 1: forecast con 92 días pasados + 16 futuros ───────────────────
    // Cubre el período: ~3 meses atrás hasta 16 días adelante del año actual.
    const fp = new URLSearchParams({
      latitude: String(LAT), longitude: String(LON),
      daily: DAILY_VARS, timezone: TZ,
      past_days: '92', forecast_days: '16',
    })

    // ── Fetch 2: archivo del año pasado para el mismo período ─────────────────
    // Da variación diaria REAL (no plana) para fechas más allá del pronóstico.
    const archStart = new Date(year - 1, month - 1, 1)
    const archEnd   = new Date(year - 1, month - 1 + 3, 0) // ≈ 90 días
    const ap = new URLSearchParams({
      latitude: String(LAT), longitude: String(LON),
      daily: DAILY_VARS, timezone: TZ,
      start_date: fmt(archStart), end_date: fmt(archEnd),
    })

    // Ambos en paralelo
    const [fRes, aRes] = await Promise.allSettled([
      fetch(`${BASE_FORECAST}?${fp}`, { next: { revalidate: 3600  } }),
      fetch(`${BASE_ARCHIVE}?${ap}`,  { next: { revalidate: 86400 } }),
    ])

    const fJson = fRes.status === 'fulfilled' && fRes.value.ok ? await fRes.value.json() : null
    const aJson = aRes.status === 'fulfilled' && aRes.value.ok ? await aRes.value.json() : null

    const forecastMap = parseDaily(fJson, 'forecast')  // keyed by YYYY-MM-DD (año actual)
    const archiveMap  = parseDaily(aJson, `hist${year - 1}`) // keyed by YYYY-MM-DD (año pasado)

    // ── Construir array de 90 días para el experimento ────────────────────────
    const days: (Day | null)[] = Array.from({ length: 90 }, (_, i) => {
      const d       = new Date(expStart)
      d.setDate(d.getDate() + i)
      const dateStr = fmt(d)
      const mmdd    = dateStr.slice(5) // "04-15"

      // Prioridad: forecast/real del año actual → archivo del año pasado → null
      if (forecastMap.has(dateStr)) return forecastMap.get(dateStr)!

      // Buscar en archivo por MM-DD (mismo día del año pasado)
      const archDate = `${year - 1}-${mmdd}`
      if (archiveMap.has(archDate)) return archiveMap.get(archDate)!

      return null // sin dato — la UI debe indicarlo
    })

    const summary = {
      real:     days.filter(d => d?.source === 'real').length,
      forecast: days.filter(d => d?.source === 'forecast').length,
      hist:     days.filter(d => d?.source?.startsWith('hist')).length,
      noData:   days.filter(d => d === null).length,
      histYear: year - 1,
    }

    return NextResponse.json({ days, summary })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
