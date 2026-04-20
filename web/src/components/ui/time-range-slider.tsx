'use client'
import { useMemo } from 'react'

function fmtDt(ms: number) {
  return new Date(ms).toLocaleString('es-BO', {
    month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit',
  })
}

interface Props {
  timeRange: { min: number; max: number } | null
  from:          number
  to:            number
  onFromChange:  (v: number) => void
  onToChange:    (v: number) => void
}

export function TimeRangeSlider({ timeRange, from, to, onFromChange, onToChange }: Props) {
  const labels = useMemo(() => {
    if (!timeRange) return null
    const span = timeRange.max - timeRange.min
    return {
      from: fmtDt(timeRange.min + (from / 100) * span),
      to:   fmtDt(timeRange.min + (to   / 100) * span),
    }
  }, [timeRange, from, to])

  if (!timeRange || timeRange.min === timeRange.max) return null

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-3 space-y-2.5">
      <p className="text-[10px] font-medium text-zinc-400 uppercase tracking-wider">Rango de tiempo</p>
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-zinc-500 w-8 shrink-0">Inicio</span>
          <input type="range" min={0} max={100} value={from}
            onChange={e => onFromChange(Math.min(+e.target.value, to - 1))}
            className="flex-1 accent-emerald-500 cursor-pointer" />
          <span className="text-[10px] text-zinc-400 w-28 text-right shrink-0">{labels?.from}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-zinc-500 w-8 shrink-0">Fin</span>
          <input type="range" min={0} max={100} value={to}
            onChange={e => onToChange(Math.max(+e.target.value, from + 1))}
            className="flex-1 accent-emerald-500 cursor-pointer" />
          <span className="text-[10px] text-zinc-400 w-28 text-right shrink-0">{labels?.to}</span>
        </div>
      </div>
    </div>
  )
}
