'use client'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui'
import { MNS, datePlus, fmtShort } from '@/lib/utils'

interface ChartPoint {
  day: number
  modelo: number | null
  real: number | null
  estimacion: number | null
}

interface SessionsChartProps {
  chartData: ChartPoint[]
  viewDays: number
  setViewDays: (v: number) => void
  projDays: number
  startYear: number
  startMonth: number
  startDateStr: string
  endDateStr: string
  xTicks: number[]
  officialPrediction: number | null
}

export function SessionsChart({
  chartData, viewDays, setViewDays, projDays,
  startYear, startMonth, startDateStr, endDateStr,
  xTicks, officialPrediction,
}: SessionsChartProps) {

  const ChartTooltip = ({ active, payload, label }: { active?: boolean; payload?: { name?: string; value?: number | null; color?: string }[]; label?: number }) => {
    if (!active || !payload?.length) return null
    const labelDate = datePlus(startYear, startMonth, label ?? 0)
    return (
      <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-3 shadow-xl text-xs space-y-1.5">
        <p className="text-zinc-400 font-medium">{fmtShort(labelDate)} · día {label}</p>
        {payload.map(p => p.value != null && (
          <div key={p.name} className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full shrink-0" style={{ background: p.color }} />
            <span className="text-zinc-400">{p.name}:</span>
            <span className="text-white font-mono">{p.value} cm</span>
          </div>
        ))}
      </div>
    )
  }

  const viewEndDate = datePlus(startYear, startMonth, viewDays)
  const endLabel    = `${fmtShort(viewEndDate)} ${viewEndDate.getFullYear()}`

  return (
    <Card>
      <CardHeader>
        <CardTitle>Modelo vs. Realidad</CardTitle>
        <CardDescription>
          <span className="text-emerald-400">Línea verde</span> = predicción del modelo ·{' '}
          <span className="text-white">Puntos blancos</span> = medidas reales ·{' '}
          <span className="text-amber-400">Puntos amarillos</span> = estimaciones visuales
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-zinc-500">{startDateStr}</span>
            <span className="text-zinc-400 font-medium">
              Ver hasta: <strong className="text-white">{endLabel}</strong>
            </span>
            <span className="text-zinc-500">
              {fmtShort(datePlus(startYear, startMonth, projDays))}
            </span>
          </div>
          <input type="range" min={7} max={projDays} step={1} value={viewDays}
            onChange={e => setViewDays(+e.target.value)}
            className="w-full accent-emerald-500" />
          <div className="relative h-4">
            {[0.25, 0.5, 0.75, 1.0].map(frac => {
              const d    = Math.round(projDays * frac)
              const date = datePlus(startYear, startMonth, d)
              const pc   = (d / projDays) * 100
              return (
                <button key={d} onClick={() => setViewDays(d)}
                  className="absolute -translate-x-1/2 text-[9px] text-zinc-600 hover:text-zinc-400 transition-colors"
                  style={{ left: `${pc}%` }}>
                  {MNS[date.getMonth()]} {date.getDate()}
                </button>
              )
            })}
          </div>
        </div>

        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 25 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
            <XAxis dataKey="day" ticks={xTicks} tick={{ fontSize: 10 }}
              tickFormatter={d => fmtShort(datePlus(startYear, startMonth, d))}
              label={{ value: `${startYear}`, position: 'insideBottom', offset: -12, fontSize: 10, fill: '#52525b' }} />
            <YAxis tick={{ fontSize: 10 }} unit="cm" />
            <Tooltip content={<ChartTooltip />} />
            <Line type="monotone" dataKey="modelo"     name="Modelo"        stroke="#34d399" strokeWidth={2}   dot={false} strokeDasharray="5 3" connectNulls={false} />
            <Line type="monotone" dataKey="real"       name="Real"          stroke="#ffffff" strokeWidth={2.5} dot={{ r: 4, fill: '#fff' }} connectNulls={false} />
            <Line type="monotone" dataKey="estimacion" name="Mi estimación" stroke="#f59e0b" strokeWidth={1.5} dot={{ r: 3, fill: '#f59e0b' }} strokeDasharray="3 2" connectNulls={false} />
            {officialPrediction && (
              <ReferenceLine y={officialPrediction} stroke="#f59e0b" strokeDasharray="8 4"
                label={{ value: `Meta: ${officialPrediction}cm`, fill: '#f59e0b', fontSize: 10 }} />
            )}
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
