'use client'
import { HelpCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui'
import { round1 } from '@/lib/utils'
import type { Sim } from '@/lib/types'

interface AyudaTabProps {
  sim: Sim
}

export function AyudaTab({ sim }: AyudaTabProps) {
  // Build example rows using the sim's optimal values as the "ideal day"
  const base = { t: sim.optimalTemp, h: sim.optimalHumidity, l: sim.optimalLight }
  const exRows = [
    { d: 1,  t: base.t,     h: base.h,      l: base.l },
    { d: 8,  t: base.t - 3, h: base.h + 7,  l: base.l - 0.5 },
    { d: 15, t: base.t + 4, h: base.h - 10, l: base.l },
  ]
  const tableRows: { d: number; t: number; et: number; h: number; eh: number; l: number; el: number; g: number; ht: number }[] = []
  let height = sim.initialHeight
  for (const ex of exRows) {
    const et = Math.max(0, 1 - Math.abs(ex.t - sim.optimalTemp) / 10)
    const eh = Math.max(0, 1 - Math.abs(ex.h - sim.optimalHumidity) / 40)
    const el = Math.min(1, ex.l / sim.optimalLight)
    const g  = round1(sim.baseGrowth * et * eh * el)
    height   = round1(height + g)
    tableRows.push({
      d: ex.d, t: ex.t, et: Math.round(et * 100),
      h: ex.h, eh: Math.round(eh * 100),
      l: ex.l, el: Math.round(el * 100), g, ht: height,
    })
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-zinc-900/60 rounded-2xl border border-zinc-800/60 p-4 flex items-start gap-3">
        <HelpCircle className="w-6 h-6 text-sky-400 shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-white">¿Cómo funciona este modelo?</p>
          <p className="text-sm text-zinc-400 mt-1 leading-relaxed">
            Explicación del modelo matemático, por qué lo usamos y cómo recrearlo en tu cuaderno.
          </p>
        </div>
      </div>

      {/* ¿Qué es? */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm text-zinc-300 uppercase tracking-wide">¿Qué es?</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-zinc-400 leading-relaxed">
          Es un <strong className="text-zinc-200">modelo de crecimiento con factores de estrés ambiental</strong>.
          Parte de una tasa de crecimiento base —cuánto crece la planta en un día ideal— y la
          multiplica por tres factores que reducen ese potencial según qué tan lejos están
          la temperatura, humedad y luz reales de los valores óptimos de tu planta.
        </CardContent>
      </Card>

      {/* La fórmula */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm text-zinc-300 uppercase tracking-wide">La fórmula</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="bg-zinc-950 rounded-xl border border-zinc-800 p-3 space-y-2 font-mono text-xs">
            <p className="text-emerald-400">crecimiento_diario = tasa_base × E_temp × E_hum × E_luz</p>
            <div className="space-y-1.5 text-zinc-500 pt-2 border-t border-zinc-800/60">
              <p><span className="text-red-300">E_temp</span> = máx(0, &nbsp;1 − |T_real − T_óptima| ÷ 10)</p>
              <p><span className="text-sky-300">E_hum</span>  = máx(0, &nbsp;1 − |H_real − H_óptima| ÷ 40)</p>
              <p><span className="text-amber-300">E_luz</span>  = mín(1, &nbsp;horas_luz ÷ horas_óptimas)</p>
            </div>
          </div>
          <p className="text-xs text-zinc-500">
            Cada factor va de <strong className="text-zinc-400">0 (condición letal)</strong> a{' '}
            <strong className="text-zinc-400">1 (condición perfecta)</strong>.
            Si la temperatura se aleja 10°C del óptimo, E_temp cae a 0 y la planta no crece.
            Si la humedad se aleja 40 puntos porcentuales, E_hum cae a 0.
          </p>
          {/* Live example with this sim's params */}
          <div className="bg-zinc-800/30 rounded-xl p-3 text-xs space-y-1 border border-zinc-800/40">
            <p className="text-zinc-400 font-medium">
              Ejemplo con tus parámetros ({sim.optimalTemp}°C · {sim.optimalHumidity}% · {sim.optimalLight}h):
            </p>
            <p className="font-mono text-zinc-500">
              Si T=<span className="text-red-300">{base.t - 3}°C</span>:{' '}
              E_temp = 1 − |{base.t - 3} − {sim.optimalTemp}| ÷ 10 ={' '}
              <span className="text-red-300">{Math.max(0, 1 - 3 / 10).toFixed(1)}</span>
            </p>
            <p className="font-mono text-zinc-500">
              Crec. = <span className="text-white">{sim.baseGrowth}</span>{' '}
              × <span className="text-red-300">{(Math.max(0, 1 - 3 / 10)).toFixed(1)}</span>{' '}
              × <span className="text-sky-300">1.0</span>{' '}
              × <span className="text-amber-300">1.0</span>{' '}
              = <span className="text-emerald-300 font-bold">{round1(sim.baseGrowth * Math.max(0, 1 - 3 / 10))} cm/día</span>
            </p>
          </div>
        </CardContent>
      </Card>

      {/* ¿Por qué lo usamos? */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm text-zinc-300 uppercase tracking-wide">¿Por qué lo usamos?</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-xs text-zinc-500">
            {([
              ['🌡️', 'Refleja la biología real',          'Las plantas no crecen igual con frío extremo o calor excesivo. El modelo penaliza esas desviaciones.'],
              ['📐', 'Es verificable a mano',              'Puedes calcular el mismo resultado con una calculadora o regla de tres en tu cuaderno.'],
              ['🔄', 'Se retroalimenta con datos reales',  'Al medir tu planta cada semana, comparas si el modelo fue preciso o qué lo hizo fallar.'],
              ['📊', 'Conecta S.T.E.A.M',                  'Matemática y ciencias naturales con datos reales de Tarija: temperatura, humedad y luz solar.'],
            ] as [string, string, string][]).map(([icon, title, desc]) => (
              <li key={title} className="flex items-start gap-2.5 bg-zinc-800/30 rounded-xl p-2.5">
                <span className="text-base shrink-0 leading-none mt-0.5">{icon}</span>
                <span><strong className="text-zinc-300">{title}:</strong> {desc}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Cómo recrearlo en el cuaderno */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm text-zinc-300 uppercase tracking-wide">Cómo recrearlo en tu cuaderno</CardTitle>
          <CardDescription>
            Dibuja esta tabla y completa una fila por cada día que midas tu planta.
            Los valores de abajo usan los parámetros de tu simulación como ejemplo.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="overflow-x-auto rounded-xl border border-zinc-800">
            <table className="min-w-full text-[10px] text-zinc-400 whitespace-nowrap">
              <thead className="bg-zinc-900/60 border-b border-zinc-800">
                <tr>
                  {['Día', 'T°C real', 'E_temp', 'H% real', 'E_hum', 'Luz h', 'E_luz', 'Crec. cm', 'Altura cm'].map(h => (
                    <th key={h} className="px-2.5 py-2 font-medium text-left">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tableRows.map(r => (
                  <tr key={r.d} className="border-b border-zinc-800/40 hover:bg-zinc-800/20">
                    <td className="px-2.5 py-2 font-mono text-zinc-300">{r.d}</td>
                    <td className="px-2.5 py-2 font-mono text-red-300">{r.t}</td>
                    <td className="px-2.5 py-2 font-mono text-red-400">{r.et}%</td>
                    <td className="px-2.5 py-2 font-mono text-sky-300">{r.h}</td>
                    <td className="px-2.5 py-2 font-mono text-sky-400">{r.eh}%</td>
                    <td className="px-2.5 py-2 font-mono text-amber-300">{r.l}</td>
                    <td className="px-2.5 py-2 font-mono text-amber-400">{r.el}%</td>
                    <td className="px-2.5 py-2 font-mono text-emerald-300">+{r.g}</td>
                    <td className="px-2.5 py-2 font-mono text-white font-semibold">{r.ht}</td>
                  </tr>
                ))}
                <tr className="bg-zinc-800/10">
                  <td colSpan={9} className="px-2.5 py-1.5 text-zinc-600 italic">
                    ↑ Ejemplo con los parámetros de tu planta · agrega una fila por cada sesión real
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="bg-zinc-900/50 rounded-xl border border-zinc-800/40 p-3 space-y-1.5 text-xs text-zinc-500">
            <p className="text-zinc-300 font-medium">Paso a paso:</p>
            <ol className="space-y-1 list-decimal list-inside">
              <li>Mide temperatura, humedad y horas de luz del día.</li>
              <li>Calcula <span className="text-red-300 font-mono">E_temp = 1 − |T − {sim.optimalTemp}| ÷ 10</span> (entre 0 y 1).</li>
              <li>Calcula <span className="text-sky-300 font-mono">E_hum = 1 − |H − {sim.optimalHumidity}| ÷ 40</span> (entre 0 y 1).</li>
              <li>Calcula <span className="text-amber-300 font-mono">E_luz = luz ÷ {sim.optimalLight}</span> (máximo 1).</li>
              <li>Multiplica: <span className="text-white font-mono">{sim.baseGrowth} × E_temp × E_hum × E_luz</span> = crecimiento del día.</li>
              <li>Suma ese valor a la altura del día anterior para obtener la nueva altura.</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
