'use client'
import { useEffect, useMemo, useState }      from 'react'
import { Thermometer, Droplets, RefreshCw }  from 'lucide-react'
import type { SensorReading, MonitoreoResponse } from '@simulador/shared'
import { SensorChart, TimeRangeSlider }  from '@/components/ui'
import { monitoreoService }  from '@/services/monitoreo.service'
import { useWsEvent }        from '@/hooks/useWsEvent'
import { WS }                from '@/ws/events'

const MAX_CACHE = 200

function computeTimeRange(readings: Record<string, SensorReading[]>) {
  const all = Object.values(readings).flat()
  if (all.length < 2) return null
  const times = all.map(r => new Date(r.timestamp).getTime()).sort((a, b) => a - b)
  return { min: times[0], max: times[times.length - 1] }
}

function applyRange(
  readings: Record<string, SensorReading[]>,
  from: number, to: number,
  tr: { min: number; max: number } | null,
): Record<string, SensorReading[]> {
  if (!tr) return readings
  const span = tr.max - tr.min
  const lo = tr.min + (from / 100) * span
  const hi = tr.min + (to   / 100) * span
  const out: Record<string, SensorReading[]> = {}
  for (const [g, arr] of Object.entries(readings))
    out[g] = arr.filter(r => { const t = new Date(r.timestamp).getTime(); return t >= lo && t <= hi })
  return out
}

export function GrupoMonitoreoSection() {
  const [data, setData]       = useState<MonitoreoResponse>({ readings: {}, lastUpdated: null })
  const [loading, setLoading] = useState(true)
  const [from, setFrom]       = useState(0)
  const [to, setTo]           = useState(100)

  useEffect(() => {
    monitoreoService.get()
      .then(d => { setData(d); setFrom(0); setTo(100) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  useWsEvent(WS.MONITOREO_UPDATE, ({ reading }) => {
    setData(prev => {
      const arr = [...(prev.readings[reading.group] ?? []), reading].slice(-MAX_CACHE)
      return { readings: { ...prev.readings, [reading.group]: arr }, lastUpdated: reading.timestamp }
    })
    setTo(100)
  }, [])

  const timeRange = useMemo(() => computeTimeRange(data.readings), [data.readings])
  const visible   = useMemo(() => applyRange(data.readings, from, to, timeRange), [data.readings, from, to, timeRange])

  const course = Object.keys(data.readings)[0] ?? null
  const latest = course ? data.readings[course]?.at(-1) : null

  if (loading) return (
    <div className="space-y-3 pt-2">
      {[1, 2, 3].map(i => <div key={i} className="h-16 rounded-xl bg-zinc-800/60 animate-pulse" />)}
    </div>
  )

  if (!course) return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-8 text-center mt-4">
      <p className="text-sm text-zinc-500">Sin datos del sensor aún.</p>
      <p className="text-xs text-zinc-600 mt-1">Los datos llegarán en cuanto el ESP32 envíe una lectura.</p>
    </div>
  )

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-white">Monitoreo en Tiempo Real</h2>
          <p className="text-xs text-zinc-500">ESP32 + DHT11 · Curso {course}</p>
        </div>
        {data.lastUpdated && (
          <span className="flex items-center gap-1 text-[10px] text-zinc-600">
            <RefreshCw className="w-3 h-3" />
            {new Date(data.lastUpdated).toLocaleTimeString('es-BO')}
          </span>
        )}
      </div>

      {latest && (
        <div className="flex gap-6 rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
          <span className="flex items-center gap-2 text-emerald-400 font-semibold text-xl">
            <Thermometer className="w-4 h-4" /> {latest.temperature.toFixed(1)} °C
          </span>
          <span className="flex items-center gap-2 text-blue-400 font-semibold text-xl">
            <Droplets className="w-4 h-4" /> {latest.humidity.toFixed(1)} %
          </span>
        </div>
      )}

      <TimeRangeSlider timeRange={timeRange} from={from} to={to} onFromChange={setFrom} onToChange={setTo} />

      <SensorChart readings={visible} />
    </div>
  )
}
