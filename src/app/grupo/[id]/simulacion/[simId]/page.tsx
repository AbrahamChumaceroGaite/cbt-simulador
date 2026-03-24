'use client'
import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft, Settings, FlaskConical, BarChart3, TableProperties,
  Lock, Unlock, Info, CheckCircle2, Plus, Save, Trash2, TrendingUp, Leaf, AlertCircle
} from 'lucide-react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine
} from 'recharts'
import {
  Button, Card, CardContent, CardHeader, CardTitle, CardDescription,
  Badge, Input, Label, SliderField, Textarea, Separator, Modal
} from '@/components/ui'
import { cn, calcEffects, generateProjection, pct, round1 } from '@/lib/utils'

type Entry = {
  id: string; sessionNum: number; date: string
  myPrediction: number | null; realHeight: number | null
  temperature: number | null; humidity: number | null; lightHours: number | null; note: string
}
type Simulation = {
  id: string; name: string; description: string; plantName: string
  isDemo: boolean; isLocked: boolean
  initialHeight: number; baseGrowth: number
  optimalTemp: number; optimalHumidity: number; optimalLight: number
  officialPrediction: number | null; predictionNote: string
  entries: Entry[]
  group: { id: string; name: string; plant: string }
}

type Tab = 'overview' | 'config' | 'data' | 'charts'

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'overview', label: 'Resumen',  icon: <Info className="w-4 h-4" /> },
  { id: 'config',   label: 'Modelo',   icon: <Settings className="w-4 h-4" /> },
  { id: 'data',     label: 'Registro', icon: <TableProperties className="w-4 h-4" /> },
  { id: 'charts',   label: 'Gráficas', icon: <BarChart3 className="w-4 h-4" /> },
]

export default function SimulationPage({ params }: { params: { id: string; simId: string } }) {
  const router = useRouter()
  const [sim, setSim]     = useState<Simulation | null>(null)
  const [tab, setTab]     = useState<Tab>('overview')
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState('')

  const load = useCallback(() =>
    fetch(`/api/simulations/${params.simId}`).then(r => r.json()).then(setSim), [params.simId])

  useEffect(() => { load() }, [load])

  function showToast(msg: string) {
    setToast(msg); setTimeout(() => setToast(''), 2500)
  }

  async function updateSim(patch: Partial<Simulation>) {
    if (!sim) return
    setSaving(true)
    const r = await fetch(`/api/simulations/${sim.id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patch),
    })
    const updated = await r.json()
    setSim(updated); setSaving(false)
    showToast('Guardado')
  }

  async function saveEntry(entry: Partial<Entry> & { sessionNum: number }) {
    if (!sim) return
    await fetch('/api/entries', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ simulationId: sim.id, ...entry }),
    })
    await load()
    showToast('Sesión guardada')
  }

  async function lockPrediction() {
    if (!sim?.officialPrediction) return
    await updateSim({ isLocked: true })
    showToast('Predicción bloqueada ✓')
  }

  if (!sim) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-6 h-6 rounded-full border-2 border-zinc-700 border-t-white animate-spin" />
    </div>
  )

  const projection = generateProjection(
    { initialHeight: sim.initialHeight, baseGrowth: sim.baseGrowth,
      optimalTemp: sim.optimalTemp, optimalHumidity: sim.optimalHumidity, optimalLight: sim.optimalLight },
    new Date('2026-03-23'), 45
  )

  return (
    <div className="min-h-screen bg-zinc-950 pb-24">
      {/* Toast */}
      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full bg-zinc-800 border border-zinc-700 text-sm text-white shadow-xl animate-in fade-in slide-in-from-top-2">
          {toast}
        </div>
      )}

      {/* Nav */}
      <header className="sticky top-0 z-10 border-b border-zinc-800/60 bg-zinc-950/80 backdrop-blur px-4 py-3 flex items-center gap-3">
        <button onClick={() => router.push(`/grupo/${params.id}`)} className="text-zinc-500 hover:text-white">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white truncate">{sim.name}</p>
          <p className="text-xs text-zinc-500">{sim.group.name} · {sim.plantName || sim.group.plant}</p>
        </div>
        <div className="flex items-center gap-2">
          {sim.isDemo && <Badge variant="demo">Tutorial</Badge>}
          {sim.isLocked && <Badge variant="amber"><Lock className="w-2.5 h-2.5 mr-1" />Bloqueada</Badge>}
          {saving && <span className="text-xs text-zinc-500">Guardando...</span>}
        </div>
      </header>

      {/* Tabs */}
      <div className="sticky top-[57px] z-10 bg-zinc-950/90 backdrop-blur border-b border-zinc-800/60 px-4">
        <div className="flex gap-0 -mb-px overflow-x-auto">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                'flex items-center gap-1.5 px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors',
                tab === t.id
                  ? 'border-white text-white'
                  : 'border-transparent text-zinc-500 hover:text-zinc-300'
              )}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>
      </div>

      <main className="max-w-2xl mx-auto px-4 py-5 space-y-4">
        {tab === 'overview' && <OverviewTab sim={sim} projection={projection} onUpdate={updateSim} onLock={lockPrediction} />}
        {tab === 'config'   && <ConfigTab   sim={sim} onUpdate={updateSim} />}
        {tab === 'data'     && <DataTab     sim={sim} onSave={saveEntry} />}
        {tab === 'charts'   && <ChartsTab   sim={sim} projection={projection} />}
      </main>
    </div>
  )
}

// ── OVERVIEW ──────────────────────────────────────────────────────────────────
function OverviewTab({ sim, projection, onUpdate, onLock }: {
  sim: Simulation; projection: ReturnType<typeof generateProjection>
  onUpdate: (p: Partial<Simulation>) => void; onLock: () => void
}) {
  const day30 = projection.find(p => p.day === 30)
  const lastEntry = sim.entries[sim.entries.length - 1]
  const cond30 = day30?.cond ?? { temperature: 15.9, humidity: 65, lightHours: 11.5 }
  const effects = calcEffects(
    { initialHeight: sim.initialHeight, baseGrowth: sim.baseGrowth,
      optimalTemp: sim.optimalTemp, optimalHumidity: sim.optimalHumidity, optimalLight: sim.optimalLight },
    cond30
  )

  if (sim.isDemo) return <DemoOverview sim={sim} projection={projection} />

  return (
    <div className="space-y-4">
      {/* Model prediction */}
      <Card>
        <CardHeader>
          <CardTitle>Predicción del modelo al día 30</CardTitle>
          <CardDescription>Condiciones estimadas de Tarija en abril (otoño)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-5xl font-bold text-white tabular-nums">
            {day30 ? round1(day30.height) : '—'} <span className="text-2xl text-zinc-500">cm</span>
          </div>

          {/* Effects */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: 'Temperatura', value: pct(effects.tempEffect), sub: `${cond30.temperature}°C vs ${sim.optimalTemp}°C` },
              { label: 'Humedad', value: pct(effects.humEffect), sub: `${cond30.humidity}% vs ${sim.optimalHumidity}%` },
              { label: 'Luz', value: pct(effects.lightEffect), sub: `${cond30.lightHours}h vs ${sim.optimalLight}h` },
            ].map(e => (
              <div key={e.label} className="bg-zinc-800/60 rounded-xl p-3 text-center space-y-1">
                <p className={cn('text-2xl font-bold tabular-nums',
                  e.value >= 80 ? 'text-emerald-400' : e.value >= 50 ? 'text-amber-400' : 'text-red-400'
                )}>{e.value}%</p>
                <p className="text-xs text-zinc-400 font-medium">{e.label}</p>
                <p className="text-xs text-zinc-600">{e.sub}</p>
              </div>
            ))}
          </div>

          <div className="text-xs text-zinc-600 bg-zinc-800/40 rounded-lg p-3 leading-5">
            Crecimiento diario en abril = {sim.baseGrowth} cm/día × {pct(effects.tempEffect)}% × {pct(effects.humEffect)}% × {pct(effects.lightEffect)}% ={' '}
            <span className="text-zinc-400 font-mono">{round1(sim.baseGrowth * effects.tempEffect * effects.humEffect * effects.lightEffect)} cm/día</span>
          </div>
        </CardContent>
      </Card>

      {/* Official prediction */}
      <Card className={sim.isLocked ? 'border-amber-900/50' : ''}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Tu predicción oficial</CardTitle>
            {sim.isLocked
              ? <Badge variant="amber"><Lock className="w-2.5 h-2.5 mr-1" />Bloqueada</Badge>
              : <Badge variant="default">Sin bloquear</Badge>
            }
          </div>
          <CardDescription>
            {sim.isLocked
              ? 'Esta predicción ya no se puede cambiar.'
              : 'Bloquéala ANTES de sembrar. No podrás cambiarla después.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {!sim.isLocked ? (
            <>
              <div className="flex gap-2 items-end">
                <div className="flex-1 space-y-1.5">
                  <Label>Mi predicción para el día 30 (cm)</Label>
                  <Input
                    type="number" step="0.1" min="0" max="100"
                    value={sim.officialPrediction ?? ''}
                    onChange={e => onUpdate({ officialPrediction: parseFloat(e.target.value) || null })}
                    className="text-2xl font-bold h-12"
                    placeholder="0.0"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>¿Por qué elegiste ese número? (al menos 2 razones)</Label>
                <Textarea
                  rows={3}
                  value={sim.predictionNote}
                  onChange={e => onUpdate({ predictionNote: e.target.value })}
                  placeholder="Ejemplo: Elegimos 8 cm porque la tasa base da ~11 cm pero el otoño reduce la temperatura a 16°C y la luz a 11.5h..."
                />
              </div>
              <Button
                onClick={onLock}
                disabled={!sim.officialPrediction}
                className="w-full bg-amber-900/40 text-amber-300 hover:bg-amber-900/60 border border-amber-900"
              >
                <Lock className="w-4 h-4" /> Bloquear predicción (esta acción no se puede deshacer)
              </Button>
            </>
          ) : (
            <div className="space-y-3">
              <div className="text-4xl font-bold text-amber-400 tabular-nums">
                {sim.officialPrediction} <span className="text-xl text-zinc-500">cm</span>
              </div>
              {sim.predictionNote && (
                <p className="text-sm text-zinc-400 leading-relaxed">{sim.predictionNote}</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Progress */}
      {lastEntry && (
        <Card>
          <CardContent className="pt-4 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-zinc-300">Progreso actual</p>
              <Badge variant="green">Sesión {lastEntry.sessionNum}</Badge>
            </div>
            {lastEntry.realHeight && sim.officialPrediction && (
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-zinc-500">
                  <span>Actual: {lastEntry.realHeight} cm</span>
                  <span>Meta: {sim.officialPrediction} cm</span>
                </div>
                <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all"
                    style={{ width: `${Math.min(100, (lastEntry.realHeight / sim.officialPrediction) * 100)}%` }}
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// ── DEMO OVERVIEW ─────────────────────────────────────────────────────────────
function DemoOverview({ sim, projection }: { sim: Simulation; projection: ReturnType<typeof generateProjection> }) {
  const day30 = projection.find(p => p.day === 30)
  return (
    <div className="space-y-4">
      <Card className="border-violet-900/50 bg-violet-950/20">
        <CardContent className="pt-5 space-y-3">
          <div className="flex items-center gap-2">
            <Leaf className="w-5 h-5 text-violet-400" />
            <p className="font-semibold text-white">Simulación Tutorial</p>
          </div>
          <p className="text-sm text-zinc-400 leading-relaxed">
            Esta simulación ya tiene datos de ejemplo para que veas cómo funciona todo.
            Explora las pestañas: <strong className="text-white">Modelo</strong> para entender las variables,
            <strong className="text-white"> Registro</strong> para ver cómo se anotan los datos de cada clase, y
            <strong className="text-white"> Gráficas</strong> para ver la comparación entre predicción y realidad.
          </p>
          <Separator />
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div><p className="text-zinc-500 text-xs">Planta</p><p className="text-white font-medium">{sim.plantName}</p></div>
            <div><p className="text-zinc-500 text-xs">Predicción oficial</p><p className="text-amber-400 font-bold">{sim.officialPrediction} cm</p></div>
            <div><p className="text-zinc-500 text-xs">Modelo predice día 30</p><p className="text-emerald-400 font-bold">{day30 ? round1(day30.height) : '—'} cm</p></div>
            <div><p className="text-zinc-500 text-xs">Sesiones registradas</p><p className="text-white font-medium">{sim.entries.length}</p></div>
          </div>
        </CardContent>
      </Card>

      {/* Steps */}
      {[
        { n: 1, title: 'Pestaña "Modelo"', desc: 'Mueve los sliders para ver cómo cada variable afecta el crecimiento. El porcentaje te dice cuánto crece respecto a su máximo.' },
        { n: 2, title: 'Pestaña "Registro"', desc: 'Cada sesión de clase anotas 4 datos: altura real, temperatura del DHT11, humedad y horas de luz. El modelo calcula el resto.' },
        { n: 3, title: 'Pestaña "Gráficas"', desc: 'Compara la línea verde (lo que predijo el modelo) con la línea blanca (lo que midieron de verdad). La diferencia es lo que explicas en el informe.' },
      ].map(s => (
        <div key={s.n} className="flex gap-3">
          <div className="w-7 h-7 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-xs font-bold text-zinc-400 flex-shrink-0 mt-0.5">
            {s.n}
          </div>
          <div>
            <p className="text-sm font-medium text-white">{s.title}</p>
            <p className="text-xs text-zinc-500 mt-0.5 leading-relaxed">{s.desc}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

// ── CONFIG TAB ────────────────────────────────────────────────────────────────
function ConfigTab({ sim, onUpdate }: { sim: Simulation; onUpdate: (p: Partial<Simulation>) => void }) {
  const [local, setLocal] = useState({
    initialHeight: sim.initialHeight, baseGrowth: sim.baseGrowth,
    optimalTemp: sim.optimalTemp, optimalHumidity: sim.optimalHumidity,
    optimalLight: sim.optimalLight, plantName: sim.plantName,
  })
  const [dirty, setDirty] = useState(false)

  const set = (k: string, v: number | string) => {
    setLocal(p => ({ ...p, [k]: v })); setDirty(true)
  }

  const cond = { temperature: local.optimalTemp, humidity: local.optimalHumidity, lightHours: local.optimalLight }
  const effects = calcEffects({ ...local }, cond)
  const dailyAtOptimal = local.baseGrowth
  const day30 = round1(local.initialHeight + local.baseGrowth * 30)

  // Current Tarija April conditions
  const aprilCond = { temperature: 15.9, humidity: 65, lightHours: 11.5 }
  const aprilEffects = calcEffects({ ...local }, aprilCond)
  const aprilDaily = round1(local.baseGrowth * aprilEffects.tempEffect * aprilEffects.humEffect * aprilEffects.lightEffect)
  const day30April = round1(local.initialHeight + aprilDaily * 30)

  return (
    <div className="space-y-4">
      {sim.isDemo && (
        <div className="bg-violet-950/30 border border-violet-900/50 rounded-xl p-3 text-xs text-violet-400">
          Esta es la simulación tutorial — mueve los sliders para explorar el modelo. Los cambios no se guardan.
        </div>
      )}

      {/* Live preview */}
      <Card>
        <CardContent className="pt-4 grid grid-cols-2 gap-4">
          <div className="text-center bg-zinc-800/50 rounded-xl p-4">
            <p className="text-xs text-zinc-500 mb-1">Sin variables (base)</p>
            <p className="text-3xl font-bold text-white">{day30}<span className="text-lg text-zinc-500"> cm</span></p>
            <p className="text-xs text-zinc-600 mt-1">al día 30 en óptimo</p>
          </div>
          <div className="text-center bg-zinc-800/50 rounded-xl p-4">
            <p className="text-xs text-zinc-500 mb-1">Con otoño Tarija (abril)</p>
            <p className="text-3xl font-bold text-emerald-400">{day30April}<span className="text-lg text-zinc-500"> cm</span></p>
            <p className="text-xs text-zinc-600 mt-1">con condiciones reales</p>
          </div>
        </CardContent>
      </Card>

      {/* Plant basics */}
      <Card>
        <CardHeader><CardTitle>Tu planta</CardTitle></CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-1.5">
            <Label>Nombre</Label>
            <Input value={local.plantName} onChange={e => set('plantName', e.target.value)} placeholder="Ej: Lechuga" />
          </div>
          <SliderField
            label="Altura inicial al plantar"
            value={local.initialHeight} min={0.5} max={10} step={0.5} unit=" cm"
            onChange={v => set('initialHeight', v)}
          />
          <SliderField
            label="Tasa base de crecimiento"
            value={local.baseGrowth} min={0.05} max={1.0} step={0.05} unit=" cm/día"
            onChange={v => set('baseGrowth', v)}
            effectLabel={`En condiciones perfectas: +${local.baseGrowth} cm cada día`}
          />
        </CardContent>
      </Card>

      {/* Variables */}
      <Card>
        <CardHeader>
          <CardTitle>Variables óptimas</CardTitle>
          <CardDescription>Las condiciones a las que tu planta crece al máximo. Si el ambiente es distinto, crece más lento.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <SliderField
            label="Temperatura óptima"
            value={local.optimalTemp} min={5} max={35} step={1} unit="°C"
            onChange={v => set('optimalTemp', v)}
            effectPct={pct(aprilEffects.tempEffect)}
            effectLabel={`Con 15.9°C (Tarija abril): ${pct(aprilEffects.tempEffect)}% del máximo. Si baja 10°C más: 0%.`}
          />
          <SliderField
            label="Humedad óptima"
            value={local.optimalHumidity} min={20} max={100} step={5} unit="%"
            onChange={v => set('optimalHumidity', v)}
            effectPct={pct(aprilEffects.humEffect)}
            effectLabel={`Con 65% de humedad: ${pct(aprilEffects.humEffect)}% del máximo.`}
          />
          <SliderField
            label="Horas de luz óptimas"
            value={local.optimalLight} min={4} max={16} step={0.5} unit="h/día"
            onChange={v => set('optimalLight', v)}
            effectPct={pct(aprilEffects.lightEffect)}
            effectLabel={`Con 11.5h de luz (Tarija abril): ${pct(aprilEffects.lightEffect)}% del máximo.`}
          />
        </CardContent>
      </Card>

      {!sim.isDemo && dirty && (
        <Button onClick={() => { onUpdate(local); setDirty(false) }} className="w-full">
          <Save className="w-4 h-4" /> Guardar configuración
        </Button>
      )}
    </div>
  )
}

// ── DATA TAB ──────────────────────────────────────────────────────────────────
function DataTab({ sim, onSave }: { sim: Simulation; onSave: (e: any) => void }) {
  const [showForm, setShowForm] = useState(false)
  const [formError, setFormError] = useState('')
  const [formSession, setFormSession] = useState<Partial<Entry> & { sessionNum: number }>({ sessionNum: (sim.entries.length + 1) })
  const nextSession = sim.entries.length + 1

  const modelHeight = (sessionNum: number) => {
    const days = (sessionNum - 1) * 3.5 // approximate days between sessions
    const cond = { temperature: 15.9, humidity: 65, lightHours: 11.5 }
    const { tempEffect, humEffect, lightEffect } = calcEffects(
      { initialHeight: sim.initialHeight, baseGrowth: sim.baseGrowth,
        optimalTemp: sim.optimalTemp, optimalHumidity: sim.optimalHumidity, optimalLight: sim.optimalLight },
      cond
    )
    return round1(sim.initialHeight + sim.baseGrowth * tempEffect * humEffect * lightEffect * days)
  }

  function openForm(entry?: Entry) {
    setFormError('')
    setFormSession(entry
      ? { ...entry, sessionNum: entry.sessionNum }
      : { sessionNum: nextSession, myPrediction: null, realHeight: null, temperature: null, humidity: null, lightHours: null, note: '' }
    )
    setShowForm(true)
  }

  async function handleSave() {
    if (formSession.realHeight != null) {
      const isEditing = sim.entries.some(e => e.id === formSession.id)
      const previousEntries = sim.entries.filter(e => e.sessionNum < formSession.sessionNum && e.realHeight != null)
      const lastEntry = previousEntries[previousEntries.length - 1]
      const minHeight = lastEntry?.realHeight ?? sim.initialHeight
      
      if (formSession.realHeight < minHeight) {
        setFormError(`La planta no puede encogerse. El tamaño real debe ser igual o mayor a ${minHeight} cm (tamaño anterior).`)
        return
      }
    }
    
    setFormError('')
    await onSave(formSession)
    setShowForm(false)
  }

  return (
    <div className="space-y-3">
      {!sim.isDemo && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-zinc-500">{sim.entries.length} sesión{sim.entries.length !== 1 ? 'es' : ''} registradas</p>
          <Button size="sm" onClick={() => openForm()} className="bg-emerald-600 hover:bg-emerald-500 text-white">
            <Plus className="w-4 h-4 mr-1" /> Sesión {nextSession}
          </Button>
        </div>
      )}

      {sim.entries.length === 0 && !sim.isDemo ? (
        <Card>
          <CardContent className="py-12 text-center space-y-2">
            <FlaskConical className="w-10 h-10 text-zinc-700 mx-auto" />
            <p className="text-sm text-emerald-500 font-medium">Lista para registrar datos</p>
            <p className="text-xs text-zinc-500">Haz clic en "Sesión 1" cuando midas tu planta por primera vez.</p>
          </CardContent>
        </Card>
      ) : (
        <Card className="overflow-hidden border-zinc-800">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left whitespace-nowrap">
              <thead className="text-xs text-zinc-400 bg-zinc-900/50 border-b border-zinc-800/60">
                <tr>
                  <th className="px-4 py-3 font-medium">Sesión</th>
                  <th className="px-4 py-3 font-medium flex items-center gap-1.5"><Settings className="w-3.5 h-3.5"/> Modelo Predice</th>
                  <th className="px-4 py-3 font-medium text-amber-500">Tú Pronosticaste</th>
                  <th className="px-4 py-3 font-medium text-emerald-400">Tamaño Real</th>
                  <th className="px-4 py-3 font-medium">Clima (T/H/Lz)</th>
                  <th className="px-4 py-3 font-medium">Nota / Diferencia</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {sim.entries.map(entry => {
                  const modelH = modelHeight(entry.sessionNum)
                  const diff = entry.realHeight != null ? round1(entry.realHeight - modelH) : null
                  return (
                    <tr 
                      key={entry.id} 
                      className={cn('bg-zinc-950/50 hover:bg-zinc-800/40 transition-colors', !sim.isDemo && 'cursor-pointer')}
                      onClick={() => !sim.isDemo && openForm(entry)}
                    >
                      <td className="px-4 py-3">
                        <div className="w-7 h-7 rounded-md bg-zinc-800 border border-zinc-700 flex items-center justify-center text-xs font-bold text-zinc-400">
                          {entry.sessionNum}
                        </div>
                      </td>
                      <td className="px-4 py-3 font-mono text-zinc-400">{modelH} cm</td>
                      <td className="px-4 py-3 font-mono text-amber-200/50">{entry.myPrediction != null ? `${entry.myPrediction} cm` : '—'}</td>
                      <td className="px-4 py-3 font-mono font-bold text-white">{entry.realHeight != null ? `${entry.realHeight} cm` : '—'}</td>
                      <td className="px-4 py-3 text-xs text-zinc-500">
                        {entry.temperature ? `${entry.temperature}°` : '-'} / {entry.humidity ? `${entry.humidity}%` : '-'} / {entry.lightHours ? `${entry.lightHours}h` : '-'}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {diff !== null && (
                            <span className={cn('text-xs font-mono font-medium', diff > 0 ? 'text-emerald-400' : diff < 0 ? 'text-red-400' : 'text-zinc-500')}>
                              {diff > 0 ? '+' : ''}{diff}cm
                            </span>
                          )}
                          {entry.note && (
                            <span className="text-xs text-zinc-500 truncate max-w-[100px] inline-block" title={entry.note}>{entry.note}</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Entry form modal */}
      <Modal open={showForm} onClose={() => setShowForm(false)} title={`Registro de la Sesión ${formSession.sessionNum}`}>
        <div className="space-y-6">
          {/* Step A */}
          <div className="space-y-3">
            <div className="bg-amber-950/20 border border-amber-900/30 rounded-lg p-3 text-xs text-amber-200/70">
              <p className="font-semibold text-amber-500 mb-1">A) Tu pronóstico visual</p>
              <p>Antes de usar la regla, ¿cuánto crees que mide la planta hoy?</p>
            </div>
            <div className="space-y-1.5">
              <Label>Tu pronóstico (cm)</Label>
              <Input type="number" step="0.1" value={formSession.myPrediction ?? ''}
                onChange={e => {
                  setFormError('')
                  setFormSession(p => ({ ...p, myPrediction: parseFloat(e.target.value) || null }))
                }}
                placeholder="Ej: 4.5" className="border-amber-900/40 focus-visible:ring-amber-500/30" />
            </div>
          </div>

          <Separator className="bg-zinc-800/60" />

          {/* Step B */}
          <div className="space-y-3">
            <div className="bg-emerald-950/20 border border-emerald-900/30 rounded-lg p-3 text-xs text-emerald-200/70">
              <p className="font-semibold text-emerald-500 mb-1">B) La medición real</p>
              <p>Mide la planta con regla y anota los datos reales de los sensores.</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2 space-y-1.5">
                <Label className="text-emerald-400">Tamaño Real (cm) *</Label>
                <Input type="number" step="0.1" placeholder="Ej: 5.2"
                  value={formSession.realHeight ?? ''}
                  onChange={e => {
                    setFormError('')
                    setFormSession(p => ({ ...p, realHeight: parseFloat(e.target.value) || null }))
                  }} className="border-emerald-900/40 focus-visible:ring-emerald-500/30" />
              </div>
              <div className="space-y-1.5">
                <Label>Temperatura °C</Label>
                <Input type="number" step="0.1" placeholder="Ej: 15.5"
                  value={formSession.temperature ?? ''}
                  onChange={e => setFormSession(p => ({ ...p, temperature: parseFloat(e.target.value) || null }))} />
              </div>
              <div className="space-y-1.5">
                <Label>Humedad %</Label>
                <Input type="number" step="1" placeholder="Ej: 64"
                  value={formSession.humidity ?? ''}
                  onChange={e => setFormSession(p => ({ ...p, humidity: parseFloat(e.target.value) || null }))} />
              </div>
              <div className="col-span-2 space-y-1.5">
                <Label>Horas de luz aprox.</Label>
                <Input type="number" step="0.5" placeholder="Ej: 11"
                  value={formSession.lightHours ?? ''}
                  onChange={e => setFormSession(p => ({ ...p, lightHours: parseFloat(e.target.value) || null }))} />
              </div>
              <div className="col-span-2 space-y-1.5">
                <Label>Di en una palabra ¿por qué creció así?</Label>
                <Input placeholder="Ej: frío, soleado, nublado, sequía..."
                  value={formSession.note ?? ''}
                  onChange={e => setFormSession(p => ({ ...p, note: e.target.value }))} />
              </div>
            </div>
          </div>

          {formError && (
            <div className="bg-red-950/30 border border-red-900/50 text-red-400 text-sm p-3 rounded-lg flex items-center">
              <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <Button variant="outline" onClick={() => setShowForm(false)} className="flex-1">Cancelar</Button>
            <Button onClick={handleSave} className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white">
              <Save className="w-4 h-4 mr-2" /> Guardar Sesión
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

// ── CHARTS TAB ────────────────────────────────────────────────────────────────
function ChartsTab({ sim, projection }: { sim: Simulation; projection: ReturnType<typeof generateProjection> }) {
  // Merge projection days with real entries
  const sessionDays = [0, 4, 7, 11, 14, 18, 21, 25, 28, 32, 35, 39, 42, 46, 49, 53, 56, 60]

  const chartData = sessionDays.slice(0, Math.max(sim.entries.length + 3, 6)).map((day, i) => {
    const proj = projection.find(p => p.day === day) ?? projection[projection.length - 1]
    const entry = sim.entries.find(e => e.sessionNum === i + 1)
    return {
      session: i + 1,
      modelo: round1(proj.height),
      real: entry?.realHeight ?? null,
      prediccion: entry?.myPrediction ?? null,
    }
  })

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null
    return (
      <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-3 shadow-xl text-xs space-y-1.5">
        <p className="text-zinc-400 font-medium">Sesión {label}</p>
        {payload.map((p: any) => (
          <div key={p.name} className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
            <span className="text-zinc-400">{p.name}:</span>
            <span className="text-white font-mono">{p.value != null ? `${p.value} cm` : '—'}</span>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Main chart */}
      <Card>
        <CardHeader>
          <CardTitle>Predicción vs Realidad</CardTitle>
          <CardDescription>Verde = lo que predice el modelo · Blanco = lo que midieron</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="session" tick={{ fontSize: 11 }} label={{ value: 'Sesión', position: 'insideBottom', offset: -2, fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} unit="cm" />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone" dataKey="modelo" name="Modelo" stroke="#34d399"
                strokeWidth={2} dot={false} strokeDasharray="5 3"
              />
              <Line
                type="monotone" dataKey="real" name="Real" stroke="#ffffff"
                strokeWidth={2.5} dot={{ r: 4, fill: '#fff' }} connectNulls={false}
              />
              {sim.officialPrediction && (
                <ReferenceLine y={sim.officialPrediction} stroke="#f59e0b" strokeDasharray="8 4"
                  label={{ value: `Meta: ${sim.officialPrediction}cm`, fill: '#f59e0b', fontSize: 10 }} />
              )}
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Effects over time */}
      {sim.entries.filter(e => e.temperature).length >= 2 && (
        <Card>
          <CardHeader>
            <CardTitle>Efecto de variables por sesión</CardTitle>
            <CardDescription>% del máximo de crecimiento por temperatura, humedad y luz</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={180}>
              <LineChart
                data={sim.entries.filter(e => e.temperature).map(e => {
                  const eff = calcEffects(
                    { initialHeight: sim.initialHeight, baseGrowth: sim.baseGrowth,
                      optimalTemp: sim.optimalTemp, optimalHumidity: sim.optimalHumidity, optimalLight: sim.optimalLight },
                    { temperature: e.temperature!, humidity: e.humidity ?? 65, lightHours: e.lightHours ?? 11.5 }
                  )
                  return { session: e.sessionNum, temp: pct(eff.tempEffect), hum: pct(eff.humEffect), luz: pct(eff.lightEffect) }
                })}
                margin={{ top: 5, right: 10, left: -20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="session" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} unit="%" domain={[0, 100]} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="temp" name="Temperatura" stroke="#f87171" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="hum" name="Humedad" stroke="#60a5fa" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="luz" name="Luz" stroke="#fbbf24" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {sim.entries.length === 0 && (
        <div className="text-center py-10 text-zinc-600 text-sm">
          Las gráficas aparecen cuando agregas datos en la pestaña Registro.
        </div>
      )}
    </div>
  )
}
