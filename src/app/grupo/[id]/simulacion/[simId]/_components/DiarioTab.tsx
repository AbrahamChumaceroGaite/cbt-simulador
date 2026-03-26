'use client'
import { useState } from 'react'
import { Plus, Save, FlaskConical, AlertCircle } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'
import { Button, Card, CardContent, CardHeader, CardTitle, CardDescription, Input, Label, Separator, Modal } from '@/components/ui'
import { cn, generateProjection, generateProjectionFromClimate, MNS, datePlus, fmtShort, round1 } from '@/lib/utils'
import type { Sim, Entry, ClimateDay, ProjPoint } from '@/lib/types'

interface DiarioTabProps {
  sim: Sim
  /** Real climate data from page-level fetch (based on saved startMonth/startYear) */
  climateDays: ClimateDay[] | null
  onSave: (e: Partial<Entry> & { sessionNum: number }) => Promise<void>
}

export function DiarioTab({ sim, climateDays, onSave }: DiarioTabProps) {
  const [showForm, setShowForm]       = useState(false)
  const [formError, setFormError]     = useState('')
  const [viewDays, setViewDays]       = useState(sim.projDays ?? 45)
  const [formSession, setFormSession] = useState<Partial<Entry> & { sessionNum: number }>({
    sessionNum: sim.entries.length + 1,
  })

  const startYear  = sim.startYear  ?? new Date().getFullYear()
  const startMonth = sim.startMonth ?? 4
  const startDay   = sim.startDay   ?? 0
  const projDays   = sim.projDays   ?? 45
  const expStart   = new Date(startYear, startMonth - 1, 1 + startDay)

  const params = {
    initialHeight: sim.initialHeight, baseGrowth: sim.baseGrowth,
    optimalTemp: sim.optimalTemp, optimalHumidity: sim.optimalHumidity, optimalLight: sim.optimalLight,
  }

  // Use real climate data when available, fall back to TARIJA monthly averages
  const fullProj: ProjPoint[] = climateDays
    ? generateProjectionFromClimate(params, climateDays, startDay, projDays)
    : generateProjection(params, expStart, projDays).map(p => ({ day: p.day, height: p.height as number | null, hasData: true }))

  // Map entries to day numbers
  const entryByDay: Record<number, Entry> = {}
  sim.entries.forEach(e => {
    const day = Math.max(0, Math.round(
      (new Date(e.date + 'T12:00:00').getTime() - expStart.getTime()) / 86400000
    ))
    entryByDay[day] = e
  })

  const step = viewDays <= 30 ? 1 : viewDays <= 60 ? 2 : 3
  const chartData = fullProj
    .slice(0, viewDays + 1)
    .filter(p => p.day % step === 0)
    .map(p => ({
      day:        p.day,
      modelo:     p.height !== null ? round1(p.height) : null,
      real:       entryByDay[p.day]?.realHeight   ?? null,
      estimacion: entryByDay[p.day]?.myPrediction ?? null,
    }))

  // Model height for a given session number (used in table and modal)
  const modelForSession = (num: number) => {
    const day   = Math.max(0, Math.round((num - 1) * 3.5))
    const point = fullProj[Math.min(day, projDays)]
    return round1(point?.height ?? sim.initialHeight)
  }

  function openForm(entry?: Entry) {
    setFormError('')
    setFormSession(entry ? { ...entry } : {
      sessionNum: sim.entries.length + 1,
      myPrediction: null, realHeight: null,
      temperature: null, humidity: null, lightHours: null, note: '',
      date: new Date().toISOString().split('T')[0],
    })
    setShowForm(true)
  }

  async function handleSave() {
    if (formSession.realHeight != null) {
      const prev = sim.entries.filter(e => e.sessionNum < formSession.sessionNum && e.realHeight != null)
      const last = prev[prev.length - 1]
      const min  = last?.realHeight ?? sim.initialHeight
      if (formSession.realHeight < min) {
        setFormError(`La planta no puede encogerse. Mínimo: ${min} cm`)
        return
      }
    }
    setFormError('')
    await onSave(formSession)
    setShowForm(false)
  }

  const viewEndDate  = datePlus(startYear, startMonth, viewDays)
  const startDateStr = fmtShort(new Date(startYear, startMonth - 1, 1))
  const endDateStr   = `${fmtShort(viewEndDate)} ${viewEndDate.getFullYear()}`

  const xTicks: number[] = []
  for (let d = 0; d <= viewDays; d += Math.max(7, Math.floor(viewDays / 6))) xTicks.push(d)
  if (!xTicks.includes(viewDays)) xTicks.push(viewDays)

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

  return (
    <div className="space-y-4">
      {/* Chart */}
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
                Ver hasta: <strong className="text-white">{endDateStr}</strong>
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
              {sim.officialPrediction && (
                <ReferenceLine y={sim.officialPrediction} stroke="#f59e0b" strokeDasharray="8 4"
                  label={{ value: `Meta: ${sim.officialPrediction}cm`, fill: '#f59e0b', fontSize: 10 }} />
              )}
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Sessions list */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-zinc-200">Registro de sesiones</p>
            <p className="text-xs text-zinc-600">
              {sim.entries.length} sesión{sim.entries.length !== 1 ? 'es' : ''}
            </p>
          </div>
          {!sim.isDemo && (
            <Button size="sm" onClick={() => openForm()}
              className="bg-emerald-600 hover:bg-emerald-500 text-white">
              <Plus className="w-4 h-4" /> Sesión {sim.entries.length + 1}
            </Button>
          )}
        </div>

        {sim.entries.length === 0 && !sim.isDemo ? (
          <Card>
            <CardContent className="py-10 text-center space-y-2">
              <FlaskConical className="w-10 h-10 text-zinc-700 mx-auto" />
              <p className="text-sm text-zinc-500">Sin sesiones aún</p>
              <p className="text-xs text-zinc-600">Cada clase que midas tu planta, registras una sesión aquí.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="w-full overflow-x-auto rounded-xl border border-zinc-800">
            <table className="min-w-full text-xs text-left whitespace-nowrap">
              <thead className="text-zinc-400 bg-zinc-900/60 border-b border-zinc-800/60">
                <tr>
                  <th className="px-3 py-3 font-medium">#</th>
                  <th className="px-3 py-3 font-medium">Fecha</th>
                  <th className="px-3 py-3 font-medium text-zinc-500">Modelo</th>
                  <th className="px-3 py-3 font-medium text-amber-500">Estim.</th>
                  <th className="px-3 py-3 font-medium text-emerald-400">Real</th>
                  <th className="px-3 py-3 font-medium">T / H / Luz</th>
                  <th className="px-3 py-3 font-medium">Dif.</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {sim.entries.map(entry => {
                  const modelH = modelForSession(entry.sessionNum)
                  const diff   = entry.realHeight != null ? round1(entry.realHeight - modelH) : null
                  return (
                    <tr key={entry.id}
                      className={cn('hover:bg-zinc-800/40 transition-colors', !sim.isDemo && 'cursor-pointer')}
                      onClick={() => !sim.isDemo && openForm(entry)}>
                      <td className="px-3 py-2.5">
                        <div className="w-6 h-6 rounded-md bg-zinc-800 border border-zinc-700 flex items-center justify-center font-bold text-zinc-400 text-[10px]">
                          {entry.sessionNum}
                        </div>
                      </td>
                      <td className="px-3 py-2.5 text-zinc-500">
                        {entry.date
                          ? new Date(entry.date).toLocaleDateString('es-BO', { day: '2-digit', month: 'short', year: '2-digit' })
                          : '—'}
                      </td>
                      <td className="px-3 py-2.5 font-mono text-zinc-500">{modelH} cm</td>
                      <td className="px-3 py-2.5 font-mono text-amber-300/70">
                        {entry.myPrediction != null ? `${entry.myPrediction} cm` : '—'}
                      </td>
                      <td className="px-3 py-2.5 font-mono font-bold text-white">
                        {entry.realHeight != null ? `${entry.realHeight} cm` : '—'}
                      </td>
                      <td className="px-3 py-2.5 text-zinc-500 text-[10px]">
                        {entry.temperature ?? '-'}° / {entry.humidity ?? '-'}% / {entry.lightHours ?? '-'}h
                      </td>
                      <td className="px-3 py-2.5">
                        {diff !== null && (
                          <span className={cn('font-mono font-medium',
                            diff > 0 ? 'text-emerald-400' : diff < 0 ? 'text-red-400' : 'text-zinc-500')}>
                            {diff > 0 ? '+' : ''}{diff}
                          </span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Session form modal */}
      <Modal open={showForm} onClose={() => setShowForm(false)} title={`Sesión ${formSession.sessionNum}`}>
        <div className="space-y-4">
          <div className="bg-zinc-800/40 rounded-xl p-3 grid grid-cols-2 gap-3 text-xs">
            <div>
              <p className="text-zinc-500">Modelo predice</p>
              <p className="text-emerald-400 font-bold font-mono text-lg">
                {modelForSession(formSession.sessionNum)} cm
              </p>
            </div>
            <div className="space-y-1.5">
              <label className="block text-zinc-500">Fecha</label>
              <Input type="date"
                value={formSession.date ?? new Date().toISOString().split('T')[0]}
                onChange={e => setFormSession(p => ({ ...p, date: e.target.value }))} />
            </div>
          </div>

          <Separator className="bg-zinc-800/60" />

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-amber-900/60 border border-amber-700/50 flex items-center justify-center text-[10px] font-bold text-amber-300 shrink-0">A</span>
              <div>
                <p className="text-xs font-semibold text-zinc-300">Estimación visual</p>
                <p className="text-xs text-zinc-600">Antes de medir, ¿cuánto crees que mide?</p>
              </div>
            </div>
            <Input type="number" step="0.1" value={formSession.myPrediction ?? ''}
              onChange={e => { setFormError(''); setFormSession(p => ({ ...p, myPrediction: parseFloat(e.target.value) || null })) }}
              placeholder="cm" className="border-amber-900/40" />
          </div>

          <Separator className="bg-zinc-800/60" />

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-emerald-900/60 border border-emerald-700/50 flex items-center justify-center text-[10px] font-bold text-emerald-300 shrink-0">B</span>
              <div>
                <p className="text-xs font-semibold text-zinc-300">Medición real + datos del sensor</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2 space-y-1.5">
                <Label className="text-emerald-400">Tamaño real (cm) *</Label>
                <Input type="number" step="0.1" placeholder="Ej: 5.2"
                  value={formSession.realHeight ?? ''}
                  onChange={e => { setFormError(''); setFormSession(p => ({ ...p, realHeight: parseFloat(e.target.value) || null })) }}
                  className="border-emerald-900/40" />
              </div>
              <div className="space-y-1.5">
                <Label>Temperatura °C</Label>
                <Input type="number" step="0.1" placeholder="15.5"
                  value={formSession.temperature ?? ''}
                  onChange={e => setFormSession(p => ({ ...p, temperature: parseFloat(e.target.value) || null }))} />
              </div>
              <div className="space-y-1.5">
                <Label>Humedad %</Label>
                <Input type="number" step="1" placeholder="64"
                  value={formSession.humidity ?? ''}
                  onChange={e => setFormSession(p => ({ ...p, humidity: parseFloat(e.target.value) || null }))} />
              </div>
              <div className="col-span-2 space-y-1.5">
                <Label>Horas de luz recibidas</Label>
                <Input type="number" step="0.5" placeholder="11"
                  value={formSession.lightHours ?? ''}
                  onChange={e => setFormSession(p => ({ ...p, lightHours: parseFloat(e.target.value) || null }))} />
              </div>
              <div className="col-span-2 space-y-1.5">
                <Label>¿Por qué creció así?</Label>
                <Input placeholder="Frío, nublado, soleado..."
                  value={formSession.note ?? ''}
                  onChange={e => setFormSession(p => ({ ...p, note: e.target.value }))} />
              </div>
            </div>
          </div>

          {formError && (
            <div className="bg-red-950/30 border border-red-900/50 text-red-400 text-xs p-3 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" /> {formError}
            </div>
          )}

          <div className="flex gap-2 pt-1">
            <Button variant="outline" onClick={() => setShowForm(false)} className="flex-1">Cancelar</Button>
            <Button onClick={handleSave} className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white">
              <Save className="w-4 h-4" /> Guardar
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
