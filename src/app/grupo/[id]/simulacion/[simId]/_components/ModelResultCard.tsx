'use client'
import { AlertTriangle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui'
import { pct, fmtShort, round1 } from '@/lib/utils'
import type { Sim } from '@/lib/types'

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

interface ModelResultCardProps {
  sim: Sim
  expStart: Date
  expEnd: Date
  projDays: number
  startCond: StartCond | null
  startEff: EffectState | null
  projAtEnd: number | null
  daysWithData: number
  noDataDays: number
}

export function ModelResultCard({
  sim, expStart, expEnd, projDays,
  startCond, startEff, projAtEnd, daysWithData, noDataDays,
}: ModelResultCardProps) {
  const daily = startEff
    ? round1(sim.baseGrowth * startEff.tempEffect * startEff.humEffect * startEff.lightEffect)
    : null

  return (
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
                Proyección al {fmtShort(expEnd)} ({projDays} días)
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
  )
}
