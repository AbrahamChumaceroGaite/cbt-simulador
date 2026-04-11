'use client'
import { useState } from 'react'
import { Lock, Save } from 'lucide-react'
import { Button, Badge, Card, CardContent, CardHeader, CardTitle, CardDescription, Input, Label, Textarea } from '@/components/ui'
import { generateProjectionFromClimate, fmtDate, round1 } from '@/lib/utils'
import type { Sim, ClimateDay, ProjPoint } from '@/lib/types'
import { DemoOverview } from './DemoOverview'

interface PrediccionTabProps {
  sim: Sim
  /** Real climate data from page-level fetch (based on saved startMonth/startYear) */
  climateDays: ClimateDay[] | null
  onUpdate: (p: Partial<Sim>) => void
}

type LocalState = { officialPrediction: number | null; predictionNote: string }

export function PrediccionTab({ sim, climateDays, onUpdate }: PrediccionTabProps) {
  const [local, setLocal] = useState<LocalState>({
    officialPrediction: sim.officialPrediction,
    predictionNote:     sim.predictionNote,
  })
  const [dirty, setDirty] = useState(false)

  const set = <K extends keyof LocalState>(k: K, v: LocalState[K]) => {
    setLocal(p => ({ ...p, [k]: v }))
    setDirty(true)
  }

  if (sim.isDemo) return <DemoOverview sim={sim} />

  const startYear  = sim.startYear  ?? new Date().getFullYear()
  const startMonth = sim.startMonth ?? 4
  const startDay   = sim.startDay   ?? 0
  const projDays   = sim.projDays   ?? 45
  const expStart   = new Date(startYear, startMonth - 1, 1 + startDay)
  const expEnd     = new Date(expStart); expEnd.setDate(expEnd.getDate() + projDays)

  const params = {
    initialHeight: sim.initialHeight, baseGrowth: sim.baseGrowth,
    optimalTemp: sim.optimalTemp, optimalHumidity: sim.optimalHumidity, optimalLight: sim.optimalLight,
  }

  const proj: ProjPoint[] = climateDays
    ? generateProjectionFromClimate(params, climateDays, startDay, projDays)
    : []

  const modelEnd   = proj.filter(p => p.height !== null).slice(-1)[0]?.height ?? sim.initialHeight
  const lastEntry  = [...sim.entries].sort((a, b) => b.sessionNum - a.sessionNum)[0]
  const usingReal  = climateDays !== null

  // Session model reference
  const modelForSession = (num: number) => {
    const day   = Math.max(0, Math.round((num - 1) * 3.5))
    const point = proj[Math.min(day, projDays)]
    return round1(point?.height ?? sim.initialHeight)
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <Card>
          <CardContent className="pt-4 pb-3">
            <p className="text-xs text-zinc-500 mb-1">Modelo predice al {fmtDate(expEnd)}</p>
            <p className="text-2xl font-bold text-emerald-400 font-mono">{modelEnd} cm</p>
            <p className="text-xs text-zinc-600 mt-1">
              {usingReal ? 'calculado con clima real' : 'estimado (promedios mensuales)'}
            </p>
          </CardContent>
        </Card>
        <Card className={sim.isLocked ? 'border-amber-900/40' : ''}>
          <CardContent className="pt-4 pb-3">
            <p className="text-xs text-zinc-500 mb-1">Tu predicción oficial</p>
            {sim.officialPrediction
              ? <p className="text-2xl font-bold text-amber-400 font-mono">{sim.officialPrediction} cm</p>
              : <p className="text-sm text-zinc-600 mt-1">Sin definir</p>}
            {sim.officialPrediction && (
              <p className="text-xs text-zinc-600 mt-1">
                {sim.isLocked ? '🔒 Bloqueada' : 'Sin bloquear'}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {lastEntry?.realHeight != null && sim.officialPrediction && (
        <Card>
          <CardContent className="pt-4 pb-3 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs text-zinc-400">Progreso · Sesión {lastEntry.sessionNum}</p>
              <Badge variant="green">
                {Math.round((lastEntry.realHeight / sim.officialPrediction) * 100)}% de la meta
              </Badge>
            </div>
            <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full transition-all"
                style={{ width: `${Math.min(100, (lastEntry.realHeight / sim.officialPrediction) * 100)}%` }} />
            </div>
            <div className="grid grid-cols-3 gap-3 text-xs">
              <div>
                <p className="text-zinc-600">Última medida</p>
                <p className="text-white font-bold font-mono">{lastEntry.realHeight} cm</p>
              </div>
              <div>
                <p className="text-zinc-600">Modelo (ref.)</p>
                <p className="text-emerald-400 font-mono">{modelForSession(lastEntry.sessionNum)} cm</p>
              </div>
              <div>
                <p className="text-zinc-600">Meta</p>
                <p className="text-amber-400 font-mono">{sim.officialPrediction} cm</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className={sim.isLocked ? 'border-amber-900/50' : ''}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Predicción oficial</CardTitle>
            {sim.isLocked
              ? <Badge variant="amber"><Lock className="w-2.5 h-2.5 mr-1" />Bloqueada</Badge>
              : <Badge variant="default">Sin bloquear</Badge>}
          </div>
          <CardDescription>
            {sim.isLocked
              ? 'Esta predicción ya no se puede cambiar.'
              : `¿Cuánto crees que medirá tu planta el ${fmtDate(expEnd)}? Bloquéala ANTES de sembrar.`}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {!sim.isLocked ? (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Mi predicción (cm)</Label>
                  <Input type="number" step="0.1" min="0" max="200"
                    value={local.officialPrediction ?? ''}
                    onChange={e => set('officialPrediction', parseFloat(e.target.value) || null)}
                    className="text-xl font-bold h-12 font-mono" placeholder="0.0" />
                </div>
                <div className="bg-zinc-800/50 rounded-xl p-3 flex flex-col justify-center">
                  <p className="text-xs text-zinc-500">Modelo predice</p>
                  <p className="text-xl font-bold text-emerald-400 font-mono">{modelEnd} cm</p>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>¿Por qué ese número? (mínimo 2 razones)</Label>
                <Textarea rows={3} value={local.predictionNote}
                  onChange={e => set('predictionNote', e.target.value)}
                  placeholder="Ej: Elegimos X cm porque la tasa base da Y pero el clima de ese mes..." />
              </div>
              {dirty && (
                <Button onClick={() => { onUpdate(local); setDirty(false) }} className="w-full">
                  <Save className="w-4 h-4" /> Guardar predicción
                </Button>
              )}
              <Button
                onClick={() => { onUpdate({ ...local, isLocked: true }); setDirty(false) }}
                disabled={!local.officialPrediction}
                className="w-full bg-amber-900/40 text-amber-300 hover:bg-amber-900/60 border border-amber-900">
                <Lock className="w-4 h-4" /> Bloquear predicción
              </Button>
            </>
          ) : (
            <div className="space-y-2">
              <p className="text-3xl font-bold text-amber-400 font-mono">{sim.officialPrediction} cm</p>
              {sim.predictionNote && (
                <p className="text-sm text-zinc-400 leading-relaxed">{sim.predictionNote}</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
