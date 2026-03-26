'use client'
import { useState, useEffect, useRef } from 'react'
import { Calendar, Thermometer, Droplets, Sun, Save, AlertTriangle } from 'lucide-react'
import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine,
} from 'recharts'
import { Button, Card, CardContent, CardHeader, CardTitle, CardDescription, Separator } from '@/components/ui'
import {
  cn, calcEffects, generateProjectionFromClimate,
  MN, MNS, datePlus, fmtDate, fmtShort, pct, round1,
} from '@/lib/utils'
import type { Sim, ClimateDay, ClimateSummary } from '@/lib/types'
import { RangeSlider } from './RangeSlider'
import { DataSourceBar } from './DataSourceBar'

interface ModeloTabProps {
  sim: Sim
  onUpdate: (p: Partial<Sim>) => void
}

type LocalState = {
  startMonth: number
  startYear: number
  startDay: number
  projDays: number
}

export function ModeloTab({ sim, onUpdate }: ModeloTabProps) {
  const [local, setLocal] = useState<LocalState>({
    startMonth: sim.startMonth ?? 4,
    startYear:  sim.startYear  ?? new Date().getFullYear(),
    startDay:   sim.startDay   ?? 0,
    projDays:   sim.projDays   ?? 45,
  })
  const [dirty, setDirty] = useState(false)
  const [climateDays, setClimateDays]       = useState<ClimateDay[] | null>(null)
  const [climateSummary, setClimateSummary] = useState<ClimateSummary | null>(null)
  const [loadingClimate, setLoadingClimate] = useState(false)
  const prevKey = useRef('')

  const setK = (k: keyof LocalState, v: number) => {
    setLocal(p => ({ ...p, [k]: v }))
    setDirty(true)
  }

  const endDay = local.startDay + local.projDays

  function handleRange(from: number, to: number) {
    setLocal(p => ({ ...p, startDay: from, projDays: to - from }))
    setDirty(true)
  }

  // Fetch climate when month or year changes
  useEffect(() => {
    const key = `${local.startMonth}-${local.startYear}`
    if (prevKey.current === key) return
    prevKey.current = key
    setLoadingClimate(true)
    fetch(`/api/climate?month=${local.startMonth}&year=${local.startYear}`)
      .then(r => r.json())
      .then(({ days, summary }) => { if (days) { setClimateDays(days); setClimateSummary(summary) } })
      .catch(() => {})
      .finally(() => setLoadingClimate(false))
  }, [local.startMonth, local.startYear])

  const expStart   = new Date(local.startYear, local.startMonth - 1, 1 + local.startDay)
  const expEnd     = datePlus(local.startYear, local.startMonth, endDay)
  const startLabel = fmtDate(expStart)
  const endLabel   = fmtDate(expEnd)

  // Month crossings within the selected window
  const crossings: { dayRel: number; name: string }[] = []
  let pm = -1
  for (let i = 0; i <= local.projDays; i++) {
    const d = new Date(expStart); d.setDate(d.getDate() + i)
    const m = d.getMonth() + 1
    if (pm !== -1 && m !== pm) crossings.push({ dayRel: i, name: MN[m - 1] })
    pm = m
  }

  // Climate chart data
  const sample = Math.max(1, Math.floor(local.projDays / 22))
  const params = {
    initialHeight: sim.initialHeight, baseGrowth: sim.baseGrowth,
    optimalTemp: sim.optimalTemp, optimalHumidity: sim.optimalHumidity, optimalLight: sim.optimalLight,
  }
  const chartData = Array.from({ length: local.projDays + 1 }, (_, i) => {
    const cd = climateDays?.[local.startDay + i]
    if (!cd) return null
    const eff = calcEffects(params, cd)
    return {
      dia: i,
      temperatura: cd.temperature,
      eficiencia: Math.round(eff.tempEffect * eff.humEffect * eff.lightEffect * 100),
      source: cd.source,
    }
  }).filter((d, i) => d !== null && i % sample === 0) as { dia: number; temperatura: number; eficiencia: number; source: string }[]

  // First available climate day
  const firstDay  = climateDays?.[local.startDay] ?? null
  const startCond = firstDay
    ? { temperature: firstDay.temperature, humidity: firstDay.humidity, lightHours: firstDay.lightHours }
    : null
  const startEff  = startCond ? calcEffects(params, startCond) : null
  const daily     = startEff ? round1(sim.baseGrowth * startEff.tempEffect * startEff.humEffect * startEff.lightEffect) : null

  // Projection using real climate
  const projFromClimate = climateDays
    ? generateProjectionFromClimate(params, climateDays, local.startDay, local.projDays)
    : null
  const lastDataPoint = projFromClimate?.filter(p => p.hasData && p.height !== null).slice(-1)[0]
  const projAtEnd     = lastDataPoint?.height ?? null
  const daysWithData  = projFromClimate?.filter(p => p.hasData).length ?? 0
  const noDataDays    = local.projDays + 1 - daysWithData

  // Slider tick marks
  const sliderTicks = [0, 15, 30, 45, 60, 75, 90].map(d => ({
    d, date: datePlus(local.startYear, local.startMonth, d),
  }))

  return (
    <div className="space-y-4">
      {sim.isDemo && (
        <div className="bg-violet-950/30 border border-violet-900/50 rounded-xl p-3 text-xs text-violet-400">
          Tutorial — ajusta el intervalo con los dos controles del slider y observa cómo cambia el pronóstico.
        </div>
      )}

      {/* Período */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-3">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-emerald-400" /> Período del experimento
              </CardTitle>
              <CardDescription className="mt-1">
                Elige el mes base y arrastra <strong className="text-zinc-300">ambos extremos</strong> del
                slider para definir cuándo inicia y cuándo termina el experimento.
              </CardDescription>
            </div>
            <div className="shrink-0 text-right bg-emerald-950/30 border border-emerald-900/30 rounded-xl px-3 py-2">
              <p className="text-[10px] text-zinc-500">Intervalo</p>
              <p className="text-xs font-semibold text-white">{startLabel}</p>
              <p className="text-xs text-zinc-400">→ {endLabel}</p>
              <p className="text-[10px] text-emerald-500 mt-0.5">{local.projDays} días</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">

          {/* Mes base */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-zinc-400">Mes base</p>
              <div className="flex items-center gap-2">
                <p className="text-xs text-zinc-500">Año:</p>
                <div className="flex gap-1">
                  {[new Date().getFullYear(), new Date().getFullYear() + 1].map(y => (
                    <button key={y} onClick={() => setK('startYear', y)}
                      className={cn('px-2 py-1 rounded-lg text-xs font-mono font-semibold transition-all',
                        local.startYear === y
                          ? 'bg-white text-zinc-900'
                          : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                      )}>
                      {y}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {MNS.map((name, i) => (
                <button key={i} onClick={() => setK('startMonth', i + 1)}
                  className={cn('shrink-0 rounded-xl px-3 py-2 text-xs font-medium transition-all text-center min-w-[52px]',
                    local.startMonth === i + 1
                      ? 'bg-emerald-700 text-white shadow-sm ring-1 ring-emerald-500'
                      : 'bg-zinc-800/60 text-zinc-400 hover:bg-zinc-700/60 hover:text-white'
                  )}>
                  {name}
                </button>
              ))}
            </div>
          </div>

          <Separator className="bg-zinc-800/60" />

          {/* Range slider */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-zinc-400">Intervalo del experimento</p>
              <div className="flex items-center gap-3 text-xs">
                <span className="text-emerald-400 font-semibold">{fmtShort(expStart)}</span>
                <span className="text-zinc-600">→</span>
                <span className="text-emerald-400 font-semibold">{fmtShort(expEnd)} {expEnd.getFullYear()}</span>
                <span className="text-zinc-500 font-mono">({local.projDays}d)</span>
              </div>
            </div>

            <RangeSlider min={0} max={90} from={local.startDay} to={endDay} onChange={handleRange} />

            <div className="relative h-5">
              {sliderTicks.map(({ d, date }) => (
                <div key={d} className="absolute -translate-x-1/2 text-center"
                  style={{ left: `${(d / 90) * 100}%` }}>
                  <div className="w-px h-1.5 bg-zinc-700 mx-auto mb-0.5" />
                  <span className="block text-[9px] text-zinc-600">{MNS[date.getMonth()]} {date.getDate()}</span>
                </div>
              ))}
            </div>

            {crossings.length > 0 && (
              <p className="text-[10px] text-zinc-600">
                Cruza a: {crossings.map(c => `${c.name} (día ${c.dayRel})`).join(' → ')}
              </p>
            )}
          </div>

          <Separator className="bg-zinc-800/60" />

          {/* Data source bar */}
          <div className="space-y-1.5">
            <p className="text-xs font-medium text-zinc-400">Fuentes de datos para este período</p>
            {loadingClimate
              ? <div className="h-5 bg-zinc-800 rounded-full animate-pulse" />
              : <DataSourceBar summary={climateSummary} projDays={local.projDays} />
            }
          </div>
        </CardContent>
      </Card>

      {/* Gráfica de clima */}
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
                  const srcLabel = src === 'real' ? `Real ${local.startYear}` : src === 'forecast' ? 'Pronóstico' : `Histórico ${local.startYear - 1}`
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

      {/* Resultado del modelo */}
      <Card className="border-emerald-900/30 bg-emerald-950/10">
        <CardHeader>
          <CardTitle>Resultado del modelo</CardTitle>
          <CardDescription>
            Predicción acumulada día a día para el intervalo seleccionado, usando el clima real del período.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {startCond && startEff && daily !== null && (
            <div className="bg-zinc-900/60 rounded-xl border border-zinc-800 p-3 space-y-2">
              <p className="text-[10px] text-zinc-500 uppercase tracking-wider">
                Fórmula · {fmtShort(expStart)} (primer día con datos)
              </p>
              <div className="flex flex-wrap items-center gap-1.5 text-xs font-mono">
                <span className="text-zinc-500">cm/día =</span>
                <span className="text-white bg-zinc-800 px-1.5 py-0.5 rounded">{sim.baseGrowth}</span>
                <span className="text-zinc-600">×</span>
                <span className="text-red-300">{pct(startEff.tempEffect)}%</span>
                <span className="text-zinc-700 text-[10px]">({startCond.temperature}°C)</span>
                <span className="text-zinc-600">×</span>
                <span className="text-sky-300">{pct(startEff.humEffect)}%</span>
                <span className="text-zinc-700 text-[10px]">({startCond.humidity}%)</span>
                <span className="text-zinc-600">×</span>
                <span className="text-amber-300">{pct(startEff.lightEffect)}%</span>
                <span className="text-zinc-700 text-[10px]">({startCond.lightHours}h)</span>
                <span className="text-zinc-600">=</span>
                <span className="text-emerald-300 font-bold text-sm">{daily} cm/día</span>
              </div>
            </div>
          )}

          {projAtEnd !== null ? (
            <div className="bg-emerald-950/30 border border-emerald-800/30 rounded-xl p-4">
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs text-zinc-500">
                  Proyección al {fmtShort(expEnd)} ({local.projDays} días)
                </p>
                {noDataDays > 0 && (
                  <span className="text-[10px] text-zinc-600 bg-zinc-800/60 px-2 py-0.5 rounded-full">
                    {daysWithData - 1}d con datos · {noDataDays}d sin datos
                  </span>
                )}
              </div>
              <div className="flex items-baseline gap-3">
                <span className="text-4xl font-bold text-emerald-400 font-mono">{projAtEnd}</span>
                <span className="text-zinc-500">cm</span>
              </div>
              <p className="text-xs text-zinc-600 mt-1">
                desde {sim.initialHeight} cm iniciales · calculado día a día con clima real
              </p>
            </div>
          ) : (
            <div className="bg-zinc-800/30 border border-zinc-700/40 rounded-xl p-4 flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
              <div>
                <p className="text-sm text-zinc-300">Sin datos climáticos para este período</p>
                <p className="text-xs text-zinc-500 mt-0.5">Cambia el intervalo o el mes base para ver la proyección.</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {!sim.isDemo && dirty && (
        <Button onClick={() => { onUpdate(local); setDirty(false) }} className="w-full">
          <Save className="w-4 h-4" /> Guardar período del experimento
        </Button>
      )}
    </div>
  )
}
