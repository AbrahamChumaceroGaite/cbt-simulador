'use client'
import { AlertTriangle } from 'lucide-react'
import type { ClimateSummary } from '@/lib/types'

interface DataSourceBarProps {
  summary: ClimateSummary | null
  projDays: number
}

export function DataSourceBar({ summary, projDays }: DataSourceBarProps) {
  if (!summary) return <div className="h-5 bg-zinc-800 rounded-full animate-pulse" />

  const total = projDays
  const rPct  = Math.round(Math.min(100, (summary.real     / total) * 100))
  const fPct  = Math.round(Math.min(100 - rPct, (summary.forecast / total) * 100))
  const hPct  = 100 - rPct - fPct

  return (
    <div className="space-y-2">
      <div className="flex h-5 rounded-full overflow-hidden text-[9px] font-semibold tracking-wide">
        {rPct > 0 && (
          <div className="bg-emerald-700 flex items-center justify-center text-white gap-0.5 shrink-0"
            style={{ width: `${rPct}%` }}>
            {rPct > 12 && '● Real'}
          </div>
        )}
        {fPct > 0 && (
          <div className="bg-sky-700 flex items-center justify-center text-white gap-0.5 shrink-0"
            style={{ width: `${fPct}%` }}>
            {fPct > 12 && '◎ Pronós.'}
          </div>
        )}
        {hPct > 0 && (
          <div className="bg-zinc-600 flex items-center justify-center text-zinc-200 gap-0.5 flex-1">
            {hPct > 12 && `▪ Hist. ${summary.histYear}`}
          </div>
        )}
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-zinc-500">
        {summary.real     > 0 && <span><span className="text-emerald-500">●</span> Medido en {summary.histYear + 1} ({summary.real}d)</span>}
        {summary.forecast > 0 && <span><span className="text-sky-500">◎</span> Pronóstico Open-Meteo ({summary.forecast}d)</span>}
        {summary.hist     > 0 && <span><span className="text-zinc-400">▪</span> Estimado — mismo período de {summary.histYear} ({summary.hist}d)</span>}
        {summary.noData   > 0 && <span><span className="text-red-500">✕</span> Sin datos ({summary.noData}d) — intervalo fuera del rango</span>}
      </div>
      {summary.hist > 0 && (
        <p className="text-[10px] text-amber-600/80 flex items-center gap-1 mt-0.5">
          <AlertTriangle className="w-3 h-3 shrink-0" />
          Los días estimados usan datos reales de {summary.histYear} (mismo período del año pasado),{' '}
          <strong>no son pronósticos de {summary.histYear + 1}</strong>.
        </p>
      )}
    </div>
  )
}
