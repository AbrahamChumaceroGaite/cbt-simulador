'use client'
import { useState } from 'react'
import { Leaf, TrendingUp, Thermometer, Droplets, Sun, Save } from 'lucide-react'
import { Button, Card, CardContent, CardHeader, CardTitle, CardDescription, Input, Label, SliderField, Textarea, Separator } from '@/components/ui'
import { round1 } from '@/lib/utils'
import type { Sim } from '@/lib/types'

interface PlantaTabProps {
  sim: Sim
  onUpdate: (p: Partial<Sim>) => void
}

type LocalState = {
  plantName: string
  description: string
  initialHeight: number
  baseGrowth: number
  optimalTemp: number
  optimalHumidity: number
  optimalLight: number
}

export function PlantaTab({ sim, onUpdate }: PlantaTabProps) {
  const [local, setLocal] = useState<LocalState>({
    plantName:       sim.plantName,
    description:     sim.description,
    initialHeight:   sim.initialHeight,
    baseGrowth:      sim.baseGrowth,
    optimalTemp:     sim.optimalTemp,
    optimalHumidity: sim.optimalHumidity,
    optimalLight:    sim.optimalLight,
  })
  const [dirty, setDirty] = useState(false)

  const set = (k: keyof LocalState, v: number | string) => {
    setLocal(p => ({ ...p, [k]: v }))
    setDirty(true)
  }

  return (
    <div className="space-y-4">
      {sim.isDemo && (
        <div className="bg-violet-950/30 border border-violet-900/50 rounded-xl p-3 text-xs text-violet-400">
          Tutorial — explora los parámetros de la planta de ejemplo.
        </div>
      )}

      {/* Identificación */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Leaf className="w-4 h-4 text-emerald-400" /> Identificación de la planta
          </CardTitle>
          <CardDescription>
            Completa con lo que investigaste sobre tu especie. Estos datos determinan
            cómo reacciona la planta al clima.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Nombre / Especie</Label>
              <Input value={local.plantName} onChange={e => set('plantName', e.target.value)}
                placeholder="Ej: Lechuga romana" />
            </div>
            <div className="space-y-1.5">
              <Label>Altura al trasplantar (cm)</Label>
              <Input type="number" step="0.5" min="0.5" max="15"
                value={local.initialHeight}
                onChange={e => set('initialHeight', parseFloat(e.target.value) || 0.5)}
                className="font-mono" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Descripción / Notas de investigación</Label>
            <Textarea rows={3} value={local.description}
              onChange={e => set('description', e.target.value)}
              placeholder="Ej: Planta de ciclo corto, prefiere climas frescos entre 15–18°C..." />
          </div>
        </CardContent>
      </Card>

      {/* Tasa de crecimiento */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" /> Potencial de crecimiento
          </CardTitle>
          <CardDescription>
            La <strong className="text-zinc-300">tasa base</strong> es el crecimiento máximo
            diario en condiciones perfectas. Investiga valores típicos para tu especie.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SliderField
            label="Tasa base (condiciones ideales)"
            value={local.baseGrowth} min={0.05} max={1.5} step={0.05} unit=" cm/día"
            onChange={v => set('baseGrowth', v)}
            effectLabel={`En 30 días ideales → ${round1(local.baseGrowth * 30)} cm · En 45 días → ${round1(local.baseGrowth * 45)} cm`}
          />
        </CardContent>
      </Card>

      {/* Condiciones óptimas */}
      <Card>
        <CardHeader>
          <CardTitle>Condiciones óptimas investigadas</CardTitle>
          <CardDescription>
            ¿Qué temperatura, humedad y luz necesita esta planta para crecer al máximo?
            El modelo compara estas condiciones con el clima real de Tarija para calcular
            qué tan eficiente será el crecimiento.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="bg-zinc-800/40 rounded-xl p-3 border border-zinc-800">
              <Thermometer className="w-5 h-5 text-red-400 mx-auto mb-1" />
              <p className="text-xs text-zinc-500">Temperatura</p>
              <p className="text-lg font-bold text-white font-mono">{local.optimalTemp}°C</p>
            </div>
            <div className="bg-zinc-800/40 rounded-xl p-3 border border-zinc-800">
              <Droplets className="w-5 h-5 text-sky-400 mx-auto mb-1" />
              <p className="text-xs text-zinc-500">Humedad</p>
              <p className="text-lg font-bold text-white font-mono">{local.optimalHumidity}%</p>
            </div>
            <div className="bg-zinc-800/40 rounded-xl p-3 border border-zinc-800">
              <Sun className="w-5 h-5 text-amber-400 mx-auto mb-1" />
              <p className="text-xs text-zinc-500">Luz / día</p>
              <p className="text-lg font-bold text-white font-mono">{local.optimalLight}h</p>
            </div>
          </div>

          <Separator className="bg-zinc-800/60" />

          <SliderField label="Temperatura óptima"
            value={local.optimalTemp} min={5} max={35} step={1} unit="°C"
            onChange={v => set('optimalTemp', v)} />
          <SliderField label="Humedad óptima"
            value={local.optimalHumidity} min={20} max={100} step={5} unit="%"
            onChange={v => set('optimalHumidity', v)} />
          <SliderField label="Horas de luz óptimas"
            value={local.optimalLight} min={4} max={16} step={0.5} unit="h/día"
            onChange={v => set('optimalLight', v)} />
        </CardContent>
      </Card>

      {!sim.isDemo && dirty && (
        <Button onClick={() => { onUpdate(local); setDirty(false) }} className="w-full">
          <Save className="w-4 h-4" /> Guardar datos de la planta
        </Button>
      )}
    </div>
  )
}
