'use client'
import { Thermometer, Droplets, Sun, AlertTriangle } from 'lucide-react'
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui'
import { cn, calcEffects, pct, fmtShort } from '@/lib/utils'
import type { ClimateSummary } from '@/lib/types'

interface EffectState {
  tempEffect: number
  humEffect: number
  lightEffect: number
}

interface StartCond {
  temperature: number
  humidity: number
  lightHours: number
}

interface ChartItem {
  dia: number
  temperatura: number
  eficiencia: number
  source: string
}

interface ClimateChartCardProps {
  expStart: Date
  expEnd: Date
  startYear: number
  startCond: StartCond | null
  startEff: EffectState | null
  climateSummary: ClimateSummary | null
  loadingClimate: boolean
  chartData: ChartItem[]
  crossings: { dayRel: number; name: string }[]
}

export function ClimateChartCard({
  expStart, expEnd, startYear, startCond, startEff,
  climateSummary, loadingClimate, chartData, crossings,
}: ClimateChartCardProps) {
  return (
    <Card className="border-sky-900/30 bg-sky-950/10">
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div>
            <CardTitle>
              Clima del período · {fmtShort(expStart)} → {fmtShort(expEnd)}
            </CardTitle>
            <CardDescription className="mt-1">
              Temperatura diaria real con variación día a día para el intervalo seleccionado.
              {climateSummary && climateSummary.hist > 0 && ` Últimos días usan histórico ${climateSummary.histYear} (misma fecha).`}
              {' '}Las <strong className="text-zinc-400">líneas verticales</strong> marcan cambio de mes.
            </CardDescription>
          </div>
          {loadingClimate && <span className="text-[10px] text-zinc-500 shrink-0 animate-pulse">Cargando...</span>}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {startCond && startEff ? (
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: 'Temp. inicio', value: `${startCond.temperature}°C`, eff: pct(startEff.tempEffect), icon: <Thermometer className="w-3 h-3" />, color: 'text-red-300' },
              { label: 'Hum. inicio',  value: `${startCond.humidity}%`,     eff: pct(startEff.humEffect),  icon: <Droplets className="w-3 h-3" />,     color: 'text-sky-300' },
              { label: 'Luz inicio',   value: `${startCond.lightHours}h`,   eff: pct(startEff.lightEffect),icon: <Sun className="w-3 h-3" />,           color: 'text-amber-300' },
            ].map(e => (
              <div key={e.label} className="bg-zinc-800/50 rounded-xl p-2.5 space-y-1.5">
                <div className="flex items-center gap-1 text-zinc-500">{e.icon}<p className="text-[10px]">{e.label}</p></div>
                <p className={cn('font-mono font-bold text-sm', e.color)}>{e.value}</p>
                <div className="h-1 bg-zinc-700 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full transition-all duration-500" style={{ width: `${e.eff}%` }} />
                </div>
                <p className="text-[10px] text-zinc-400">{e.eff}% efic.</p>
              </div>
            ))}
          </div>
        ) : !loadingClimate && (
          <div className="bg-zinc-800/30 rounded-xl p-3 text-xs text-zinc-500 flex items-center gap-2">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            Sin datos climáticos para el día de inicio seleccionado.
          </div>
        )}

        {chartData.length === 0 ? (
          <div className="h-36 flex items-center justify-center text-xs text-zinc-600">
            {loadingClimate ? 'Cargando datos climáticos...' : 'Sin datos para este período.'}
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={150}>
            <ComposedChart data={chartData} margin={{ top: 4, right: 36, left: -22, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
              <XAxis dataKey="dia" tick={{ fontSize: 9, fill: '#71717a' }}
                tickFormatter={d => { const dt = new Date(expStart); dt.setDate(dt.getDate() + d); return fmtShort(dt) }} />
              <YAxis yAxisId="t" domain={[0, 40]} tick={{ fontSize: 9, fill: '#71717a' }} unit="°" />
              <YAxis yAxisId="p" orientation="right" domain={[0, 100]} tick={{ fontSize: 9, fill: '#71717a' }} unit="%" />
              <Tooltip content={({ active, payload, label }) => {
                if (!active || !payload?.length) return null
                const dt = new Date(expStart); dt.setDate(dt.getDate() + (label as number))
                const src = (payload[0]?.payload as { source?: string })?.source ?? ''
                const srcLabel = src === 'real' ? `Real ${startYear}` : src === 'forecast' ? 'Pronóstico' : `Histórico ${startYear - 1}`
                return (
                  <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-2 text-xs shadow-xl space-y-1">
                    <p className="text-zinc-400">{fmtShort(dt)} · <span className="text-zinc-500">{srcLabel}</span></p>
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    {(payload as any[]).map((p, i) => p.value != null && (
                      <div key={i} className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
                        <span className="text-zinc-300">{p.name}: <strong className="text-white">{p.value}{p.unit ?? ''}</strong></span>
                      </div>
                    ))}
                  </div>
                )
              }} />
              <Bar yAxisId="t" dataKey="temperatura" name="Temp." unit="°C" fill="#f97316" opacity={0.6} radius={[2, 2, 0, 0]} />
              <Line yAxisId="p" dataKey="eficiencia" name="Eficiencia" unit="%" stroke="#34d399" strokeWidth={2} dot={false} />
              {crossings.map(c => (
                <ReferenceLine key={c.dayRel} yAxisId="t" x={c.dayRel}
                  stroke="#52525b" strokeDasharray="4 2"
                  label={{ value: c.name, fill: '#a1a1aa', fontSize: 9, position: 'insideTopRight' }} />
              ))}
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}
