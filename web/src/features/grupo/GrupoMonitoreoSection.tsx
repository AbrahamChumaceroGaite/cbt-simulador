'use client'
import { useEffect, useState }               from 'react'
import { Thermometer, Droplets, RefreshCw }  from 'lucide-react'
import type { SensorReading, MonitoreoResponse } from '@simulador/shared'
import { SensorChart }       from '@/components/ui'
import { monitoreoService }  from '@/services/monitoreo.service'
import { useWsEvent }        from '@/hooks/useWsEvent'
import { WS }                from '@/ws/events'

const MAX_CACHE = 200

export function GrupoMonitoreoSection() {
  const [data, setData]       = useState<MonitoreoResponse>({ readings: {}, lastUpdated: null })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    monitoreoService.get()
      .then(setData)
      .finally(() => setLoading(false))
  }, [])

  useWsEvent(WS.MONITOREO_UPDATE, ({ reading }) => {
    setData(prev => {
      const arr = [...(prev.readings[reading.group] ?? []), reading].slice(-MAX_CACHE)
      return { readings: { ...prev.readings, [reading.group]: arr }, lastUpdated: reading.timestamp }
    })
  }, [])

  const groups  = Object.keys(data.readings)
  const course  = groups[0] ?? null
  const latest  = course ? data.readings[course]?.at(-1) : null

  if (loading) return (
    <div className="space-y-3">
      {[1, 2].map(i => <div key={i} className="h-16 rounded-xl bg-zinc-800/60 animate-pulse" />)}
    </div>
  )

  if (!course) return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-6 text-center">
      <p className="text-sm text-zinc-500">Sin datos del sensor aún.</p>
      <p className="text-xs text-zinc-600 mt-1">Los datos llegarán en cuanto el ESP32 envíe una lectura.</p>
    </div>
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-white">Monitoreo — {course}</h3>
          <p className="text-xs text-zinc-500">Sensor ambiental en tiempo real</p>
        </div>
        {data.lastUpdated && (
          <span className="flex items-center gap-1 text-[10px] text-zinc-600">
            <RefreshCw className="w-3 h-3" />
            {new Date(data.lastUpdated).toLocaleTimeString('es-BO')}
          </span>
        )}
      </div>

      {latest && (
        <div className="flex gap-4 rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
          <span className="flex items-center gap-2 text-emerald-400 font-semibold text-lg">
            <Thermometer className="w-4 h-4" /> {latest.temperature.toFixed(1)} °C
          </span>
          <span className="flex items-center gap-2 text-blue-400 font-semibold text-lg">
            <Droplets className="w-4 h-4" /> {latest.humidity.toFixed(1)} %
          </span>
        </div>
      )}

      <SensorChart readings={data.readings} />
    </div>
  )
}
