'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Sprout, FlaskConical, ArrowLeft, Copy, CheckCheck, LogOut } from 'lucide-react'
import type { GroupResponse } from '@simulador/shared'
import { Button, Modal, Input, Label, EmptyState, Tooltip, Pagination } from '@/components/ui'
import { groupsService }      from '@/services/groups.service'
import { simulationsService } from '@/services/simulations.service'
import { authService }        from '@/services/auth.service'
import { SimCard }        from '@/features/grupo/SimCard'
import { MembersSection } from '@/features/grupo/MembersSection'
import { useWsEvent }     from '@/hooks/useWsEvent'
import { WS }             from '@/ws/events'

type Group = GroupResponse

export default function GroupPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [group, setGroup]       = useState<Group | null>(null)
  const [showCreate, setShowCreate] = useState(false)
  const [simName, setSimName]   = useState('')
  const [creating, setCreating] = useState(false)
  const [copied, setCopied]     = useState(false)
  const [simPage, setSimPage]   = useState(0)
  const [simPageSize, setSimPageSize] = useState(10)

  const load = () => groupsService.getById(params.id).then(setGroup)
  useEffect(() => { load() }, [])

  // Refresh when admin records a new entry for this group's simulations
  useWsEvent(WS.ENTRY_SAVED, ({ groupId }) => {
    if (groupId === params.id) load()
  }, [params.id])

  async function logout() {
    await authService.logout()
    router.push('/login')
  }

  async function createSim() {
    if (!simName.trim() || !group) return
    setCreating(true)
    const sim = await simulationsService.create({
      groupId: group.id, name: simName.trim(), plantName: group.plant,
      baseGrowth:  group.plant === 'Lechuga' ? 0.30 : group.plant === 'Tomate' ? 0.25 : 0.20,
      optimalTemp: group.plant === 'Lechuga' ? 18   : group.plant === 'Tomate' ? 22   : 20,
    })
    setCreating(false); setShowCreate(false); setSimName('')
    router.push(`/grupo/${group.id}/simulacion/${sim.id}`)
  }

  function copyCode() {
    if (!group) return
    navigator.clipboard.writeText(group.code).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000) })
  }

  if (!group) return (
    <div className="min-h-screen bg-zinc-950 relative overflow-hidden">
      <div aria-hidden className="pointer-events-none fixed inset-0 overflow-hidden z-0">
        <div className="blob blob-1" /><div className="blob blob-2" /><div className="blob blob-3" />
      </div>
      <div className="fixed top-3 left-3 right-3 z-20 rounded-2xl border border-zinc-800/70 bg-zinc-950/90 backdrop-blur-md px-4 py-3 flex items-center gap-3">
        <div className="w-5 h-5 rounded bg-zinc-800 animate-pulse" />
        <div className="w-7 h-7 rounded-lg bg-zinc-800 animate-pulse" />
        <div className="flex-1 space-y-1.5">
          <div className="h-3.5 w-32 rounded bg-zinc-800 animate-pulse" />
          <div className="h-2.5 w-20 rounded bg-zinc-800/60 animate-pulse" />
        </div>
        <div className="h-7 w-16 rounded-lg bg-zinc-800 animate-pulse" />
        <div className="h-8 w-8 rounded-lg bg-zinc-800 animate-pulse" />
      </div>
      <main className="max-w-2xl mx-auto px-4 pt-20 pb-8 space-y-6">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="h-3 w-24 rounded bg-zinc-800 animate-pulse" />
            <div className="h-7 w-20 rounded-lg bg-zinc-800 animate-pulse" />
          </div>
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-3 space-y-2">
            {[1,2,3].map(i => (
              <div key={i} className="flex items-center gap-3 py-2">
                <div className="w-7 h-7 rounded-full bg-zinc-800 animate-pulse" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 w-28 rounded bg-zinc-800 animate-pulse" />
                  <div className="h-2.5 w-16 rounded bg-zinc-800/60 animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="h-3 w-32 rounded bg-zinc-800 animate-pulse" />
            <div className="h-7 w-20 rounded-lg bg-zinc-800 animate-pulse" />
          </div>
          {[1,2].map(i => (
            <div key={i} className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-zinc-800 animate-pulse" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3.5 w-40 rounded bg-zinc-800 animate-pulse" />
                  <div className="h-2.5 w-24 rounded bg-zinc-800/60 animate-pulse" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )

  const allSims  = group.simulations ?? []
  const realSims = allSims.filter(s => !s.isDemo)
  const demoSims = allSims.filter(s => s.isDemo)

  return (
    <div className="min-h-screen bg-zinc-950 relative overflow-hidden">
      <div aria-hidden className="pointer-events-none fixed inset-0 overflow-hidden z-0">
        <div className="blob blob-1" /><div className="blob blob-2" /><div className="blob blob-3" />
      </div>

      <header className="fixed top-3 left-3 right-3 z-20 rounded-2xl border border-zinc-800/70 bg-zinc-950/90 backdrop-blur-md shadow-xl shadow-black/40 px-4 py-3 flex items-center gap-3">
        <Tooltip content="Volver al panel" side="bottom">
          <button onClick={() => router.push('/admin')} className="text-zinc-500 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
        </Tooltip>
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-emerald-950 border border-emerald-900 flex items-center justify-center flex-shrink-0">
            <Sprout className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-white truncate">{group.name}</p>
            <p className="text-xs text-zinc-500">{group.course} · {group.plant}</p>
          </div>
        </div>
        <Tooltip content="Copiar código de acceso" side="bottom">
          <button onClick={copyCode}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-emerald-900/60 bg-emerald-950/40 hover:border-emerald-700 text-xs font-mono text-emerald-400 hover:text-emerald-300 transition-colors">
            {copied ? <CheckCheck className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {group.code}
          </button>
        </Tooltip>
        <Tooltip content="Cerrar sesión" side="bottom">
          <button onClick={logout} className="p-2 rounded-lg text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 transition-colors">
            <LogOut className="w-4 h-4" />
          </button>
        </Tooltip>
      </header>

      <main className="max-w-2xl mx-auto px-4 pt-20 pb-8 space-y-6">
        <MembersSection groupId={params.id} />

        {demoSims.length > 0 && (
          <section className="space-y-3">
            <p className="text-xs font-medium text-zinc-500 uppercase tracking-wide">Tutorial</p>
            {demoSims.map(sim => <SimCard key={sim.id} sim={sim} groupId={group.id} />)}
          </section>
        )}

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
              action={<Button size="sm" onClick={() => setShowCreate(true)}><Plus className="w-3.5 h-3.5" /> Crear simulación</Button>}
            />
          ) : (
            <>
              {realSims.slice(simPage * simPageSize, (simPage + 1) * simPageSize).map(sim => (
                <SimCard key={sim.id} sim={sim} groupId={group.id} />
              ))}
              <Pagination page={simPage} totalItems={realSims.length} pageSize={simPageSize}
                onPageSizeChange={s => { setSimPageSize(s); setSimPage(0) }} onChange={setSimPage} />
            </>
          )}
        </section>
      </main>

      <footer className="relative z-10 text-center py-6 text-zinc-700 text-xs">
        Ing. Abraham CG &mdash; 2026 · All rights reserved
      </footer>

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Nueva simulación">
        <div className="space-y-4">
          <p className="text-sm text-zinc-500">Ponle un nombre a esta simulación. Puedes hacer varias para comparar diferentes escenarios.</p>
          <div className="space-y-1.5">
            <Label>Nombre de la simulación</Label>
            <Input placeholder="Ej: Prueba con mucho sol, Escenario frío..." value={simName}
              onChange={e => setSimName(e.target.value)} onKeyDown={e => e.key === 'Enter' && createSim()} autoFocus />
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
