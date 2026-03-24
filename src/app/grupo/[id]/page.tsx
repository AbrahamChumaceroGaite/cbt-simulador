'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Sprout, FlaskConical, ArrowLeft, Copy, CheckCheck, BarChart3, Leaf } from 'lucide-react'
import { Button, Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter, Badge, Modal, Input, Label, EmptyState } from '@/components/ui'

type Sim = {
  id: string; name: string; description: string; plantName: string
  isDemo: boolean; isLocked: boolean; officialPrediction: number | null
  _count: { entries: number }
  entries: { realHeight: number | null }[]
}
type Group = {
  id: string; name: string; course: string; plant: string; code: string
  simulations: Sim[]
}

export default function GroupPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [group, setGroup] = useState<Group | null>(null)
  const [showCreate, setShowCreate] = useState(false)
  const [simName, setSimName] = useState('')
  const [creating, setCreating] = useState(false)
  const [copied, setCopied] = useState(false)

  const load = () => fetch(`/api/groups/${params.id}`).then(r => r.json()).then(setGroup)
  useEffect(() => { load() }, [])

  async function createSim() {
    if (!simName.trim() || !group) return
    setCreating(true)
    const r = await fetch('/api/simulations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        groupId: group.id, name: simName.trim(),
        plantName: group.plant,
        baseGrowth: group.plant === 'Lechuga' ? 0.30 : group.plant === 'Tomate' ? 0.25 : 0.20,
        optimalTemp: group.plant === 'Lechuga' ? 18 : group.plant === 'Tomate' ? 22 : 20,
      }),
    })
    const sim = await r.json()
    setCreating(false); setShowCreate(false); setSimName('')
    router.push(`/grupo/${group.id}/simulacion/${sim.id}`)
  }

  function copyCode() {
    if (!group) return
    navigator.clipboard.writeText(group.code).then(() => {
      setCopied(true); setTimeout(() => setCopied(false), 2000)
    })
  }

  if (!group) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-6 h-6 rounded-full border-2 border-zinc-700 border-t-white animate-spin" />
    </div>
  )

  const realSims = group.simulations.filter(s => !s.isDemo)
  const demoSims = group.simulations.filter(s => s.isDemo)

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Nav */}
      <header className="sticky top-0 z-10 border-b border-zinc-800/60 bg-zinc-950/80 backdrop-blur px-4 py-3 flex items-center gap-3">
        <button onClick={() => router.push('/')} className="text-zinc-500 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-emerald-950 border border-emerald-900 flex items-center justify-center flex-shrink-0">
            <Sprout className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-white truncate">{group.name}</p>
            <p className="text-xs text-zinc-500">{group.course} · {group.plant}</p>
          </div>
        </div>
        <button
          onClick={copyCode}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-zinc-700 hover:border-zinc-500 text-xs font-mono text-zinc-400 hover:text-white transition-colors"
        >
          {copied ? <CheckCheck className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          {group.code}
        </button>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">

        {/* Demo sims */}
        {demoSims.length > 0 && (
          <section className="space-y-3">
            <p className="text-xs font-medium text-zinc-500 uppercase tracking-wide">Tutorial</p>
            {demoSims.map(sim => (
              <SimCard key={sim.id} sim={sim} groupId={group.id} />
            ))}
          </section>
        )}

        {/* My sims */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-zinc-500 uppercase tracking-wide">
              Mis simulaciones {realSims.length > 0 && `· ${realSims.length}`}
            </p>
            <Button size="sm" onClick={() => setShowCreate(true)}>
              <Plus className="w-3.5 h-3.5" /> Nueva
            </Button>
          </div>

          {realSims.length === 0 ? (
            <EmptyState
              icon={<FlaskConical className="w-10 h-10" />}
              title="Sin simulaciones todavía"
              description="Crea tu primera simulación y empieza a predecir el crecimiento de tu planta."
              action={
                <Button size="sm" onClick={() => setShowCreate(true)}>
                  <Plus className="w-3.5 h-3.5" /> Crear simulación
                </Button>
              }
            />
          ) : (
            realSims.map(sim => (
              <SimCard key={sim.id} sim={sim} groupId={group.id} />
            ))
          )}
        </section>
      </main>

      {/* Create modal */}
      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Nueva simulación">
        <div className="space-y-4">
          <p className="text-sm text-zinc-500">Ponle un nombre a esta simulación. Puedes hacer varias para comparar diferentes escenarios.</p>
          <div className="space-y-1.5">
            <Label>Nombre de la simulación</Label>
            <Input
              placeholder="Ej: Prueba con mucho sol, Escenario frío..."
              value={simName}
              onChange={e => setSimName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && createSim()}
            />
          </div>
          <div className="flex gap-2 pt-1">
            <Button variant="outline" onClick={() => setShowCreate(false)} className="flex-1">Cancelar</Button>
            <Button onClick={createSim} disabled={creating || !simName.trim()} className="flex-1">
              {creating ? 'Creando...' : 'Crear'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

function SimCard({ sim, groupId }: { sim: Sim; groupId: string }) {
  const router = useRouter()
  const lastReal = sim.entries[0]?.realHeight
  const sessions = sim._count.entries

  return (
    <Card
      className="cursor-pointer hover:border-zinc-700 transition-colors active:scale-[0.99]"
      onClick={() => router.push(`/grupo/${groupId}/simulacion/${sim.id}`)}
    >
      <CardContent className="pt-4 pb-4">
        <div className="flex items-start gap-3">
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
            sim.isDemo ? 'bg-violet-950 border border-violet-900' : 'bg-zinc-800 border border-zinc-700'
          }`}>
            {sim.isDemo ? <Leaf className="w-4 h-4 text-violet-400" /> : <BarChart3 className="w-4 h-4 text-zinc-400" />}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-sm font-medium text-white">{sim.name}</p>
              {sim.isDemo && <Badge variant="demo">Tutorial</Badge>}
              {sim.isLocked && !sim.isDemo && <Badge variant="amber">Predicción bloqueada</Badge>}
              {sim.officialPrediction && <Badge variant="blue">Pred: {sim.officialPrediction} cm</Badge>}
            </div>
            {sim.description && <p className="text-xs text-zinc-500 mt-0.5 truncate">{sim.description}</p>}
            <div className="flex items-center gap-3 mt-2 text-xs text-zinc-600">
              <span>{sessions} sesión{sessions !== 1 ? 'es' : ''}</span>
              {lastReal != null && <span>Última medida: <span className="text-zinc-400">{lastReal} cm</span></span>}
              {sim.plantName && <span>{sim.plantName}</span>}
            </div>
          </div>
          <ArrowLeft className="w-4 h-4 text-zinc-600 rotate-180 flex-shrink-0 mt-1" />
        </div>
      </CardContent>
    </Card>
  )
}
