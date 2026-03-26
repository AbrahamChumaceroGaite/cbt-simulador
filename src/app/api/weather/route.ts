import { NextResponse } from 'next/server'

// Tarija, Bolivia
const LAT = -21.5355
const LON = -64.7296

/**
 * Proxy para Open-Meteo — pronóstico diario de 14 días para Tarija.
 * Cacheado 1 hora para no saturar la API gratuita.
 * daylight_duration (segundos de luz del día) se divide entre 3600 → horas,
 * que es lo mismo que representa TARIJA_BY_MONTH.lightHours (fotoperíodo).
 */
export async function GET() {
  try {
    const params = new URLSearchParams({
      latitude:      String(LAT),
      longitude:     String(LON),
      daily:         'temperature_2m_max,temperature_2m_min,relative_humidity_2m_mean,daylight_duration,precipitation_sum',
      timezone:      'America/La_Paz',
      forecast_days: '14',
    })

    const res = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`, {
      next: { revalidate: 3600 },
    })
    if (!res.ok) throw new Error(`Open-Meteo HTTP ${res.status}`)

    const { daily } = await res.json()

    const days = (daily.time as string[]).map((date: string, i: number) => ({
      date,
      temperature:   Math.round(((daily.temperature_2m_max[i] + daily.temperature_2m_min[i]) / 2) * 10) / 10,
      humidity:      Math.round(daily.relative_humidity_2m_mean[i]),
      lightHours:    Math.round((daily.daylight_duration[i] / 3600) * 10) / 10,
      precipitation: Math.round((daily.precipitation_sum[i] ?? 0) * 10) / 10,
    }))

    return NextResponse.json({ days })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
