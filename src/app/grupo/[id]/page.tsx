'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Sprout, FlaskConical, ArrowLeft, Copy, CheckCheck, LogOut, UserPlus } from 'lucide-react'
import { Button, Card, CardContent, Modal, Input, Label, EmptyState } from '@/components/ui'
import { SimCard }    from './_components/SimCard'
import { MemberForm } from './_components/MemberForm'

type Member = { id: string; name: string; role: string }
type Sim = {
  id: string; name: string; description: string; plantName: string
  isDemo: boolean; isLocked: boolean; officialPrediction: number | null
  _count: { entries: number }
  entries: { realHeight: number | null }[]
}
type Group = { id: string; name: string; course: string; plant: string; code: string; simulations: Sim[] }

export default function GroupPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [group, setGroup]         = useState<Group | null>(null)
  const [members, setMembers]     = useState<Member[]>([])
  const [showCreate, setShowCreate] = useState(false)
  const [simName, setSimName]     = useState('')
  const [creating, setCreating]   = useState(false)
  const [copied, setCopied]       = useState(false)

  const [showAddMember, setShowAddMember] = useState(false)
  const [editMember, setEditMember]       = useState<Member | null>(null)
  const [deleteMemberId, setDeleteMemberId] = useState<string | null>(null)
  const [memberForm, setMemberForm]       = useState({ name: '', role: '' })
  const [savingMember, setSavingMember]   = useState(false)

  const load        = () => fetch(`/api/groups/${params.id}`).then(r => r.json()).then(setGroup)
  const loadMembers = () => fetch(`/api/members?groupId=${params.id}`).then(r => r.json()).then(setMembers)

  useEffect(() => { load(); loadMembers() }, [])

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
  }

  async function createSim() {
    if (!simName.trim() || !group) return
    setCreating(true)
    const r = await fetch('/api/simulations', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        groupId: group.id, name: simName.trim(), plantName: group.plant,
        baseGrowth:   group.plant === 'Lechuga' ? 0.30 : group.plant === 'Tomate' ? 0.25 : 0.20,
        optimalTemp:  group.plant === 'Lechuga' ? 18   : group.plant === 'Tomate' ? 22   : 20,
      }),
    })
    const sim = await r.json()
    setCreating(false); setShowCreate(false); setSimName('')
    router.push(`/grupo/${group.id}/simulacion/${sim.id}`)
  }

  function copyCode() {
    if (!group) return
    navigator.clipboard.writeText(group.code).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000) })
  }

  async function addMember() {
    if (!memberForm.name.trim()) return
    setSavingMember(true)
    await fetch('/api/members', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ groupId: params.id, name: memberForm.name, role: memberForm.role }),
    })
    setSavingMember(false); setShowAddMember(false); setMemberForm({ name: '', role: '' }); loadMembers()
  }

  async function updateMember() {
    if (!editMember || !memberForm.name.trim()) return
    setSavingMember(true)
    await fetch(`/api/members/${editMember.id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: memberForm.name, role: memberForm.role }),
    })
    setSavingMember(false); setEditMember(null); loadMembers()
  }

  async function deleteMember() {
    if (!deleteMemberId) return
    await fetch(`/api/members/${deleteMemberId}`, { method: 'DELETE' })
    setDeleteMemberId(null); loadMembers()
  }

  function openEdit(m: Member) {
    setMemberForm({ name: m.name, role: m.role }); setEditMember(m)
  }

  if (!group) return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950">
      <div className="w-6 h-6 rounded-full border-2 border-zinc-700 border-t-emerald-400 animate-spin" />
    </div>
  )

  const realSims = group.simulations.filter(s => !s.isDemo)
  const demoSims = group.simulations.filter(s => s.isDemo)

  return (
    <div className="min-h-screen bg-zinc-950 relative overflow-hidden">
      <div aria-hidden className="pointer-events-none fixed inset-0 overflow-hidden z-0">
        <div className="blob blob-1" /><div className="blob blob-2" /><div className="blob blob-3" />
      </div>

      <header className="fixed top-3 left-3 right-3 z-20 rounded-2xl border border-zinc-800/70 bg-zinc-950/90 backdrop-blur-md shadow-xl shadow-black/40 px-4 py-3 flex items-center gap-3">
        <button onClick={() => router.push('/admin')} className="text-zinc-500 hover:text-white transition-colors">
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
          onClick={copyCode} title="Copia este código para iniciar sesión"
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-emerald-900/60 bg-emerald-950/40 hover:border-emerald-700 text-xs font-mono text-emerald-400 hover:text-emerald-300 transition-colors"
        >
          {copied ? <CheckCheck className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          {group.code}
        </button>
        <button onClick={logout} title="Cerrar sesión" className="p-2 rounded-lg text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 transition-colors">
          <LogOut className="w-4 h-4" />
        </button>
      </header>

      <main className="max-w-2xl mx-auto px-4 pt-20 pb-8 space-y-6">
        {/* Members */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-zinc-500 uppercase tracking-wide">
              Integrantes {members.length > 0 && `· ${members.length}`}
            </p>
            <Button size="sm" variant="ghost" onClick={() => { setMemberForm({ name: '', role: '' }); setShowAddMember(true) }}>
              <UserPlus className="w-3.5 h-3.5" /> Agregar
            </Button>
          </div>

          {members.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="pt-4 pb-4">
                <button onClick={() => { setMemberForm({ name: '', role: '' }); setShowAddMember(true) }}
                  className="w-full flex items-center gap-3 text-left group">
                  <div className="w-8 h-8 rounded-lg border border-zinc-700 flex items-center justify-center group-hover:border-zinc-500 transition-colors">
                    <UserPlus className="w-3.5 h-3.5 text-zinc-500 group-hover:text-zinc-300" />
                  </div>
                  <div>
                    <p className="text-sm text-zinc-400 group-hover:text-zinc-200 transition-colors">Registra a los integrantes del grupo</p>
                    <p className="text-xs text-zinc-600">Nombre y rol de cada miembro</p>
                  </div>
                </button>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="pt-3 pb-3 space-y-0">
                {members.map((m, i) => (
                  <div key={m.id} className={`flex items-center gap-3 py-2.5 ${i < members.length - 1 ? 'border-b border-zinc-800/60' : ''}`}>
                    <div className="w-7 h-7 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center flex-shrink-0 text-xs font-bold text-zinc-400">
                      {m.name[0]?.toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white truncate">{m.name}</p>
                      {m.role && <p className="text-xs text-zinc-500">{m.role}</p>}
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={() => openEdit(m)} className="p-1 rounded text-zinc-600 hover:text-zinc-300 hover:bg-zinc-800 transition-colors">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                      </button>
                      <button onClick={() => setDeleteMemberId(m.id)} className="p-1 rounded text-zinc-600 hover:text-red-400 hover:bg-red-950/30 transition-colors">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </section>

        {/* Demo sims */}
        {demoSims.length > 0 && (
          <section className="space-y-3">
            <p className="text-xs font-medium text-zinc-500 uppercase tracking-wide">Tutorial</p>
            {demoSims.map(sim => <SimCard key={sim.id} sim={sim} groupId={group.id} />)}
          </section>
        )}

        {/* Real sims */}
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
            realSims.map(sim => <SimCard key={sim.id} sim={sim} groupId={group.id} />)
          )}
        </section>
      </main>

      <footer className="relative z-10 text-center py-6 text-zinc-700 text-xs">
        Ing. Abraham CG &mdash; 2026 · All rights reserved
      </footer>

      {/* Create sim modal */}
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

      {/* Add member modal */}
      <Modal open={showAddMember} onClose={() => setShowAddMember(false)} title="Agregar integrante">
        <MemberForm form={memberForm} setForm={setMemberForm} onCancel={() => setShowAddMember(false)} onSave={addMember} saving={savingMember} />
      </Modal>

      {/* Edit member modal */}
      <Modal open={!!editMember} onClose={() => setEditMember(null)} title="Editar integrante">
        <MemberForm form={memberForm} setForm={setMemberForm} onCancel={() => setEditMember(null)} onSave={updateMember} saving={savingMember} />
      </Modal>

      {/* Delete member confirm */}
      <Modal open={!!deleteMemberId} onClose={() => setDeleteMemberId(null)} title="Eliminar integrante">
        <div className="space-y-4">
          <p className="text-sm text-zinc-400">¿Eliminar este integrante del grupo?</p>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setDeleteMemberId(null)} className="flex-1">Cancelar</Button>
            <Button variant="destructive" onClick={deleteMember} className="flex-1">Eliminar</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
