'use client'
import { Calendar } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, Separator } from '@/components/ui'
import { MNS, fmtDate, fmtShort } from '@/lib/utils'
import type { ClimateSummary } from '@/lib/types'
import { RangeSlider }   from './RangeSlider'
import { DataSourceBar } from './DataSourceBar'

interface SliderTick { d: number; date: Date }

interface ExperimentPeriodCardProps {
  startMonth: number
  startYear: number
  startDay: number
  projDays: number
  endDay: number
  expStart: Date
  expEnd: Date
  sliderTicks: SliderTick[]
  crossings: { dayRel: number; name: string }[]
  loadingClimate: boolean
  climateSummary: ClimateSummary | null
  onSetMonth: (v: number) => void
  onSetYear: (v: number) => void
  onRange: (from: number, to: number) => void
}

export function ExperimentPeriodCard({
  startMonth, startYear, startDay, projDays, endDay,
  expStart, expEnd, sliderTicks, crossings,
  loadingClimate, climateSummary,
  onSetMonth, onSetYear, onRange,
}: ExperimentPeriodCardProps) {
  return (
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
            <p className="text-xs font-semibold text-white">{fmtDate(expStart)}</p>
            <p className="text-xs text-zinc-400">→ {fmtDate(expEnd)}</p>
            <p className="text-[10px] text-emerald-500 mt-0.5">{projDays} días</p>
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
                  <button key={y} onClick={() => onSetYear(y)}
                    className={`px-2 py-1 rounded-lg text-xs font-mono font-semibold transition-all ${
                      startYear === y ? 'bg-white text-zinc-900' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                    }`}>
                    {y}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {MNS.map((name, i) => (
              <button key={i} onClick={() => onSetMonth(i + 1)}
                className={`shrink-0 rounded-xl px-3 py-2 text-xs font-medium transition-all text-center min-w-[52px] ${
                  startMonth === i + 1
                    ? 'bg-emerald-700 text-white shadow-sm ring-1 ring-emerald-500'
                    : 'bg-zinc-800/60 text-zinc-400 hover:bg-zinc-700/60 hover:text-white'
                }`}>
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
              <span className="text-zinc-500 font-mono">({projDays}d)</span>
            </div>
          </div>

          <RangeSlider min={0} max={90} from={startDay} to={endDay} onChange={onRange} />

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

        <div className="space-y-1.5">
          <p className="text-xs font-medium text-zinc-400">Fuentes de datos para este período</p>
          {loadingClimate
            ? <div className="h-5 bg-zinc-800 rounded-full animate-pulse" />
            : <DataSourceBar summary={climateSummary} projDays={projDays} />
          }
        </div>
      </CardContent>
    </Card>
  )
}
