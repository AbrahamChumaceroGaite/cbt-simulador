'use client'
import { Leaf } from 'lucide-react'
import { Card, CardContent, Separator } from '@/components/ui'
import type { Sim } from '@/lib/types'

const STEPS = [
  { tab: 'Planta',     desc: 'Define las condiciones óptimas de tu especie y la tasa de crecimiento base. Esto es lo que investigaron.' },
  { tab: 'Modelo',     desc: 'Selecciona cuándo siembras y cuántos días dura el experimento. El gráfico muestra el clima real de Tarija para ese período.' },
  { tab: 'Diario',     desc: 'Cada sesión registras tu estimación visual, la medición real, temperatura, humedad y horas de luz. La gráfica compara con el modelo.' },
  { tab: 'Predicción', desc: 'Define tu predicción oficial antes de sembrar y bloquéala. Aquí se muestra el progreso real vs. tu predicción.' },
]

export function DemoOverview({ sim: _sim }: { sim: Sim }) {
  return (
    <div className="space-y-4">
      <Card className="border-violet-900/50 bg-violet-950/20">
        <CardContent className="pt-5 space-y-3">
          <div className="flex items-center gap-2">
            <Leaf className="w-5 h-5 text-violet-400" />
            <p className="font-semibold text-white">Simulación Tutorial</p>
          </div>
          <p className="text-sm text-zinc-400 leading-relaxed">
            Explora las pestañas para entender el sistema:
          </p>
          <Separator />
          {STEPS.map((s, i) => (
            <div key={s.tab} className="flex gap-3">
              <div className="w-7 h-7 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-xs font-bold text-zinc-400 flex-shrink-0 mt-0.5">
                {i + 1}
              </div>
              <div>
                <p className="text-sm font-medium text-white">Pestaña &quot;{s.tab}&quot;</p>
                <p className="text-xs text-zinc-500 mt-0.5 leading-relaxed">{s.desc}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
