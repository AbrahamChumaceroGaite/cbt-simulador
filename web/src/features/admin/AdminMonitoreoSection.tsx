'use client'
import { useEffect, useMemo, useState }     from 'react'
import { Thermometer, Droplets, RefreshCw } from 'lucide-react'
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

function LatestCard({ group, reading }: { group: string; reading: SensorReading }) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 space-y-2">
      <p className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">{group}</p>
      <div className="flex gap-4">
        <span className="flex items-center gap-1.5 text-sm text-emerald-400">
          <Thermometer className="w-3.5 h-3.5" /> {reading.temperature.toFixed(1)} °C
        </span>
        <span className="flex items-center gap-1.5 text-sm text-blue-400">
          <Droplets className="w-3.5 h-3.5" /> {reading.humidity.toFixed(1)} %
        </span>
      </div>
      <p className="text-[10px] text-zinc-600">{new Date(reading.timestamp).toLocaleString('es-BO')}</p>
    </div>
  )
}

export function AdminMonitoreoSection() {
  const [data, setData]       = useState<MonitoreoResponse>({ readings: {}, lastUpdated: null })
  const [filter, setFilter]   = useState<string>('todos')
  const [loading, setLoading] = useState(true)
  const [from, setFrom]       = useState(0)
  const [to, setTo]           = useState(100)

  useEffect(() => {
    monitoreoService.get()
      .then(d => { setData(d); setFrom(0); setTo(100) })
      .finally(() => setLoading(false))
  }, [])

  useWsEvent(WS.MONITOREO_UPDATE, ({ reading }) => {
    setData(prev => {
      const arr = [...(prev.readings[reading.group] ?? []), reading].slice(-MAX_CACHE)
      return { readings: { ...prev.readings, [reading.group]: arr }, lastUpdated: reading.timestamp }
    })
    setTo(100)
  }, [])

  const groups   = Object.keys(data.readings)
  const filtered = useMemo(() => {
    if (filter === 'todos') return data.readings
    const arr = data.readings[filter]
    return arr ? { [filter]: arr } : {}
  }, [data.readings, filter])

  const timeRange = useMemo(() => computeTimeRange(filtered), [filtered])
  const visible   = useMemo(() => applyRange(filtered, from, to, timeRange), [filtered, from, to, timeRange])

  const latestPerGroup = useMemo(() =>
    Object.entries(data.readings).map(([g, arr]) => ({ group: g, reading: arr[arr.length - 1] }))
      .filter(x => x.reading),
  [data.readings])

  if (loading) return (
    <div className="space-y-3">
      {[1, 2, 3].map(i => <div key={i} className="h-20 rounded-xl bg-zinc-800 animate-pulse" />)}
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-white">Monitoreo en Tiempo Real</h2>
          <p className="text-xs text-zinc-500">ESP32 + DHT11 vía ThingSpeak</p>
        </div>
        {data.lastUpdated && (
          <span className="flex items-center gap-1 text-[10px] text-zinc-600">
            <RefreshCw className="w-3 h-3" />
            {new Date(data.lastUpdated).toLocaleTimeString('es-BO')}
          </span>
        )}
      </div>

      {latestPerGroup.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {latestPerGroup.map(({ group, reading }) => (
            <LatestCard key={group} group={group} reading={reading} />
          ))}
        </div>
      )}

      <div className="flex gap-2 flex-wrap">
        {['todos', ...groups].map(g => (
          <button key={g} onClick={() => { setFilter(g); setFrom(0); setTo(100) }}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
              filter === g
                ? 'bg-emerald-900/60 text-emerald-300 border border-emerald-700/50'
                : 'bg-zinc-800/60 text-zinc-400 border border-zinc-700/40 hover:bg-zinc-700/50'
            }`}>
            {g === 'todos' ? 'Todos los grupos' : g}
          </button>
        ))}
        {groups.length === 0 && (
          <span className="text-xs text-zinc-600">Sin datos aún — esperando lecturas del sensor</span>
        )}
      </div>

      <TimeRangeSlider timeRange={timeRange} from={from} to={to} onFromChange={setFrom} onToChange={setTo} />

      <SensorChart readings={visible} />
    </div>
  )
}
