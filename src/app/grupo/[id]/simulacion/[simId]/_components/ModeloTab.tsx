'use client'
import { useState, useEffect, useRef } from 'react'
import { Save } from 'lucide-react'
import { Button } from '@/components/ui'
import { calcEffects, generateProjectionFromClimate, MN, MNS, datePlus, round1 } from '@/lib/utils'
import type { Sim, ClimateDay, ClimateSummary } from '@/lib/types'
import { ExperimentPeriodCard } from './ExperimentPeriodCard'
import { ClimateChartCard }     from './ClimateChartCard'
import { ModelResultCard }       from './ModelResultCard'

interface ModeloTabProps {
  sim: Sim
  onUpdate: (p: Partial<Sim>) => void
}

type LocalState = { startMonth: number; startYear: number; startDay: number; projDays: number }

export function ModeloTab({ sim, onUpdate }: ModeloTabProps) {
  const [local, setLocal] = useState<LocalState>({
    startMonth: sim.startMonth ?? 4,
    startYear:  sim.startYear  ?? new Date().getFullYear(),
    startDay:   sim.startDay   ?? 0,
    projDays:   sim.projDays   ?? 45,
  })
  const [dirty, setDirty]               = useState(false)
  const [climateDays, setClimateDays]   = useState<ClimateDay[] | null>(null)
  const [climateSummary, setClimateSummary] = useState<ClimateSummary | null>(null)
  const [loadingClimate, setLoadingClimate] = useState(false)
  const prevKey = useRef('')

  const setK = (k: keyof LocalState, v: number) => { setLocal(p => ({ ...p, [k]: v })); setDirty(true) }
  const endDay = local.startDay + local.projDays

  function handleRange(from: number, to: number) {
    setLocal(p => ({ ...p, startDay: from, projDays: to - from }))
    setDirty(true)
  }

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

  const expStart = new Date(local.startYear, local.startMonth - 1, 1 + local.startDay)
  const expEnd   = datePlus(local.startYear, local.startMonth, endDay)

  // Month crossings within the selected window
  const crossings: { dayRel: number; name: string }[] = []
  let pm = -1
  for (let i = 0; i <= local.projDays; i++) {
    const d = new Date(expStart); d.setDate(d.getDate() + i)
    const m = d.getMonth() + 1
    if (pm !== -1 && m !== pm) crossings.push({ dayRel: i, name: MN[m - 1] })
    pm = m
  }

  const params = {
    initialHeight: sim.initialHeight, baseGrowth: sim.baseGrowth,
    optimalTemp: sim.optimalTemp, optimalHumidity: sim.optimalHumidity, optimalLight: sim.optimalLight,
  }

  const sample    = Math.max(1, Math.floor(local.projDays / 22))
  const chartData = Array.from({ length: local.projDays + 1 }, (_, i) => {
    const cd = climateDays?.[local.startDay + i]
    if (!cd) return null
    const eff = calcEffects(params, cd)
    return {
      dia:         i,
      temperatura: cd.temperature,
      eficiencia:  Math.round(eff.tempEffect * eff.humEffect * eff.lightEffect * 100),
      source:      cd.source,
    }
  }).filter((d, i) => d !== null && i % sample === 0) as { dia: number; temperatura: number; eficiencia: number; source: string }[]

  const firstDay  = climateDays?.[local.startDay] ?? null
  const startCond = firstDay ? { temperature: firstDay.temperature, humidity: firstDay.humidity, lightHours: firstDay.lightHours } : null
  const startEff  = startCond ? calcEffects(params, startCond) : null

  const projFromClimate = climateDays ? generateProjectionFromClimate(params, climateDays, local.startDay, local.projDays) : null
  const lastDataPoint   = projFromClimate?.filter(p => p.hasData && p.height !== null).slice(-1)[0]
  const projAtEnd       = lastDataPoint ? round1(lastDataPoint.height!) : null
  const daysWithData    = projFromClimate?.filter(p => p.hasData).length ?? 0
  const noDataDays      = local.projDays + 1 - daysWithData

  const sliderTicks = [0, 15, 30, 45, 60, 75, 90].map(d => ({ d, date: datePlus(local.startYear, local.startMonth, d) }))

  return (
    <div className="space-y-4">
      {sim.isDemo && (
        <div className="bg-violet-950/30 border border-violet-900/50 rounded-xl p-3 text-xs text-violet-400">
          Tutorial — ajusta el intervalo con los dos controles del slider y observa cómo cambia el pronóstico.
        </div>
      )}

      <ExperimentPeriodCard
        startMonth={local.startMonth}
        startYear={local.startYear}
        startDay={local.startDay}
        projDays={local.projDays}
        endDay={endDay}
        expStart={expStart}
        expEnd={expEnd}
        sliderTicks={sliderTicks}
        crossings={crossings}
        loadingClimate={loadingClimate}
        climateSummary={climateSummary}
        onSetMonth={v => setK('startMonth', v)}
        onSetYear={v => setK('startYear', v)}
        onRange={handleRange}
      />

      <ClimateChartCard
        expStart={expStart}
        expEnd={expEnd}
        startYear={local.startYear}
        startCond={startCond}
        startEff={startEff}
        climateSummary={climateSummary}
        loadingClimate={loadingClimate}
        chartData={chartData}
        crossings={crossings}
      />

      <ModelResultCard
        sim={sim}
        expStart={expStart}
        expEnd={expEnd}
        projDays={local.projDays}
        startCond={startCond}
        startEff={startEff}
        projAtEnd={projAtEnd}
        daysWithData={daysWithData}
        noDataDays={noDataDays}
      />

      {!sim.isDemo && dirty && (
        <Button onClick={() => { onUpdate(local); setDirty(false) }} className="w-full">
          <Save className="w-4 h-4" /> Guardar período del experimento
        </Button>
      )}
    </div>
  )
}
