'use client'
import { useState } from 'react'
import { Plus, FlaskConical, Download } from 'lucide-react'
import { Button, Card, CardContent, Tooltip as UITooltip, Pagination } from '@/components/ui'
import { cn, generateProjection, generateProjectionFromClimate, datePlus, fmtShort, round1 } from '@/lib/utils'
import type { Sim, Entry, ClimateDay, ProjPoint } from '@/lib/types'
import { SessionsChart }    from './SessionsChart'
import { SessionFormModal } from './SessionFormModal'

type FormSession = Partial<Entry> & { sessionNum: number }

interface DiarioTabProps {
  sim: Sim
  climateDays: ClimateDay[] | null
  onSave: (e: FormSession) => Promise<void>
}

export function DiarioTab({ sim, climateDays, onSave }: DiarioTabProps) {
  const [showForm, setShowForm]       = useState(false)
  const [formError, setFormError]     = useState('')
  const [viewDays, setViewDays]       = useState(sim.projDays ?? 45)
  const [entryPage, setEntryPage]     = useState(0)
  const [entryPageSize, setEntryPageSize] = useState(10)
  const [formSession, setFormSession] = useState<FormSession>({ sessionNum: sim.entries.length + 1 })

  const startYear  = sim.startYear  ?? new Date().getFullYear()
  const startMonth = sim.startMonth ?? 4
  const startDay   = sim.startDay   ?? 0
  const projDays   = sim.projDays   ?? 45
  const expStart   = new Date(startYear, startMonth - 1, 1 + startDay)

  const params = {
    initialHeight: sim.initialHeight, baseGrowth: sim.baseGrowth,
    optimalTemp: sim.optimalTemp, optimalHumidity: sim.optimalHumidity, optimalLight: sim.optimalLight,
  }

  const fullProj: ProjPoint[] = climateDays
    ? generateProjectionFromClimate(params, climateDays, startDay, projDays)
    : generateProjection(params, expStart, projDays).map(p => ({ day: p.day, height: p.height as number | null, hasData: true }))

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

  const modelForSession = (num: number) => {
    const day   = Math.max(0, Math.round((num - 1) * 3.5))
    const point = fullProj[Math.min(day, projDays)]
    return round1(point?.height ?? sim.initialHeight)
  }

  const xTicks: number[] = []
  for (let d = 0; d <= viewDays; d += Math.max(7, Math.floor(viewDays / 6))) xTicks.push(d)
  if (!xTicks.includes(viewDays)) xTicks.push(viewDays)

  const startDateStr = fmtShort(new Date(startYear, startMonth - 1, 1))

  function exportCSV() {
    const headers = ['Sesión', 'Fecha', 'Modelo (cm)', 'Mi estimación (cm)', 'Real (cm)', 'Temp °C', 'Humedad %', 'Luz (h)', 'Diferencia (cm)', 'Nota']
    const rows = sim.entries.map(entry => {
      const modelH = modelForSession(entry.sessionNum)
      const diff   = entry.realHeight != null ? round1(entry.realHeight - modelH) : ''
      const date   = entry.date ? new Date(entry.date).toLocaleDateString('es-BO', { day: '2-digit', month: '2-digit', year: 'numeric' }) : ''
      return [
        entry.sessionNum, date, modelH, entry.myPrediction ?? '', entry.realHeight ?? '',
        entry.temperature ?? '', entry.humidity ?? '', entry.lightHours ?? '', diff,
        `"${(entry.note ?? '').replace(/"/g, '""')}"`,
      ].join(',')
    })
    const csv  = [headers.join(','), ...rows].join('\n')
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href = url; a.download = `${sim.name.replace(/\s+/g, '_')}_sesiones.csv`; a.click()
    URL.revokeObjectURL(url)
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

  return (
    <div className="space-y-4">
      <SessionsChart
        chartData={chartData}
        viewDays={viewDays}
        setViewDays={setViewDays}
        projDays={projDays}
        startYear={startYear}
        startMonth={startMonth}
        startDateStr={startDateStr}
        endDateStr={`${fmtShort(datePlus(startYear, startMonth, viewDays))} ${datePlus(startYear, startMonth, viewDays).getFullYear()}`}
        xTicks={xTicks}
        officialPrediction={sim.officialPrediction}
      />

      {/* Sessions list */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-zinc-200">Registro de sesiones</p>
            <p className="text-xs text-zinc-600">{sim.entries.length} sesión{sim.entries.length !== 1 ? 'es' : ''}</p>
          </div>
          <div className="flex items-center gap-2">
            {sim.entries.length > 0 && (
              <UITooltip content="Descargar registro CSV" side="bottom">
                <Button size="sm" variant="ghost" onClick={exportCSV}>
                  <Download className="w-3.5 h-3.5" /> CSV
                </Button>
              </UITooltip>
            )}
            {!sim.isDemo && (
              <Button size="sm" onClick={() => openForm()}
                className="bg-emerald-600 hover:bg-emerald-500 text-white">
                <Plus className="w-4 h-4" /> Sesión {sim.entries.length + 1}
              </Button>
            )}
          </div>
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
          <>
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
                  {sim.entries.slice(entryPage * entryPageSize, (entryPage + 1) * entryPageSize).map(entry => {
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
                          {entry.date ? new Date(entry.date).toLocaleDateString('es-BO', { day: '2-digit', month: 'short', year: '2-digit' }) : '—'}
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
            <Pagination page={entryPage} totalItems={sim.entries.length} pageSize={entryPageSize}
              onPageSizeChange={s => { setEntryPageSize(s); setEntryPage(0) }} onChange={setEntryPage} />
          </>
        )}
      </div>

      <SessionFormModal
        open={showForm}
        onClose={() => setShowForm(false)}
        formSession={formSession}
        setFormSession={setFormSession}
        formError={formError}
        setFormError={setFormError}
        modelPrediction={modelForSession(formSession.sessionNum)}
        onSave={handleSave}
      />
    </div>
  )
}
