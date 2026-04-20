'use client'
import {
  ResponsiveContainer, LineChart, Line,
  XAxis, YAxis, Tooltip, Legend, CartesianGrid,
} from 'recharts'
import type { SensorReading } from '@simulador/shared'

const GROUP_COLORS: Record<string, string> = {
  S2A: '#34d399',
  S2B: '#60a5fa',
  S2C: '#a78bfa',
}
const FALLBACK_COLORS = ['#f472b6', '#fb923c', '#facc15', '#2dd4bf']

function colorFor(group: string, index: number) {
  return GROUP_COLORS[group] ?? FALLBACK_COLORS[index % FALLBACK_COLORS.length]
}

function fmtTime(iso: string) {
  try { return new Date(iso).toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit' }) }
  catch { return iso }
}

interface Props {
  readings: Record<string, SensorReading[]>
  title?:   string
}

export function SensorChart({ readings, title }: Props) {
  const groups = Object.keys(readings)
  if (!groups.length) return (
    <div className="flex items-center justify-center h-32 text-zinc-600 text-sm">Sin datos disponibles</div>
  )

  // Merge all timestamps into a unified timeline per metric
  const allTimestamps = Array.from(new Set(groups.flatMap(g => readings[g].map(r => r.timestamp)))).sort()

  const data = allTimestamps.map(ts => {
    const point: Record<string, string | number> = { ts }
    for (const g of groups) {
      const r = readings[g].find(x => x.timestamp === ts)
      if (r) { point[`${g}_temp`] = r.temperature; point[`${g}_hum`] = r.humidity }
    }
    return point
  })

  // Keep last 80 points for readability
  const slice = data.slice(-80)

  return (
    <div className="space-y-6">
      {title && <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider">{title}</p>}

      <div>
        <p className="text-xs text-zinc-500 mb-2">Temperatura (°C)</p>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={slice} margin={{ top: 4, right: 8, bottom: 0, left: -16 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
            <XAxis dataKey="ts" tickFormatter={fmtTime} tick={{ fontSize: 10, fill: '#71717a' }} interval="preserveStartEnd" />
            <YAxis tick={{ fontSize: 10, fill: '#71717a' }} domain={['auto', 'auto']} />
            <Tooltip
              contentStyle={{ background: '#18181b', border: '1px solid #3f3f46', borderRadius: 8, fontSize: 12 }}
              labelFormatter={fmtTime}
            />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            {groups.map((g, i) => (
              <Line key={g} type="monotone" dataKey={`${g}_temp`} name={`${g} temp`}
                stroke={colorFor(g, i)} dot={false} strokeWidth={2} connectNulls />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div>
        <p className="text-xs text-zinc-500 mb-2">Humedad (%)</p>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={slice} margin={{ top: 4, right: 8, bottom: 0, left: -16 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
            <XAxis dataKey="ts" tickFormatter={fmtTime} tick={{ fontSize: 10, fill: '#71717a' }} interval="preserveStartEnd" />
            <YAxis tick={{ fontSize: 10, fill: '#71717a' }} domain={['auto', 'auto']} />
            <Tooltip
              contentStyle={{ background: '#18181b', border: '1px solid #3f3f46', borderRadius: 8, fontSize: 12 }}
              labelFormatter={fmtTime}
            />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            {groups.map((g, i) => (
              <Line key={g} type="monotone" dataKey={`${g}_hum`} name={`${g} hum`}
                stroke={colorFor(g, i)} dot={false} strokeWidth={2} strokeDasharray="4 2" connectNulls />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
