'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Sprout, LogOut, Plus, Pencil, Trash2, ChevronRight, Users, FlaskConical, Copy, CheckCheck } from 'lucide-react'
import { Button, Card, CardContent, Modal, Badge, EmptyState } from '@/components/ui'
import { GroupForm } from './_components/GroupForm'

type Group = {
  id: string; name: string; course: string; plant: string; code: string
  _count: { simulations: number; members: number }
  createdAt: string
}

export default function AdminPage() {
  const router = useRouter()
  const [groups, setGroups]     = useState<Group[]>([])
  const [loading, setLoading]   = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [editGroup, setEditGroup]   = useState<Group | null>(null)
  const [deleteId, setDeleteId]     = useState<string | null>(null)
  const [form, setForm]         = useState({ name: '', course: 'S2A', plant: 'Lechuga' })
  const [saving, setSaving]     = useState(false)
  const [copied, setCopied]     = useState<string | null>(null)

  async function load() {
    setLoading(true)
    const r = await fetch('/api/groups')
    setGroups(await r.json())
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
  }

  async function createGroup() {
    if (!form.name.trim()) return
    setSaving(true)
    await fetch('/api/groups', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    setSaving(false); setShowCreate(false); setForm({ name: '', course: 'S2A', plant: 'Lechuga' }); load()
  }

  async function updateGroup() {
    if (!editGroup || !form.name.trim()) return
    setSaving(true)
    await fetch(`/api/groups/${editGroup.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    setSaving(false); setEditGroup(null); load()
  }

  async function deleteGroup() {
    if (!deleteId) return
    await fetch(`/api/groups/${deleteId}`, { method: 'DELETE' })
    setDeleteId(null); load()
  }

  function openEdit(g: Group) {
    setForm({ name: g.name, course: g.course, plant: g.plant }); setEditGroup(g)
  }

  function copyCode(code: string) {
    navigator.clipboard.writeText(code).then(() => { setCopied(code); setTimeout(() => setCopied(null), 2000) })
  }

  if (loading) return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
      <div className="w-6 h-6 rounded-full border-2 border-zinc-700 border-t-emerald-400 animate-spin" />
    </div>
  )

  return (
    <div className="min-h-screen bg-zinc-950 relative overflow-hidden">
      <div aria-hidden className="pointer-events-none fixed inset-0 overflow-hidden z-0">
        <div className="blob blob-1" /><div className="blob blob-2" /><div className="blob blob-3" />
      </div>

      <header className="fixed top-3 left-3 right-3 z-20 rounded-2xl border border-zinc-800/70 bg-zinc-950/90 backdrop-blur-md shadow-xl shadow-black/40 px-4 py-3 flex items-center gap-3">
        <div className="w-7 h-7 rounded-lg bg-emerald-950 border border-emerald-900 flex items-center justify-center flex-shrink-0">
          <Sprout className="w-3.5 h-3.5 text-emerald-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white">Panel Administrativo</p>
          <p className="text-xs text-zinc-500">Plant Diary · S.T.E.A.M #2</p>
        </div>
        <button onClick={logout} title="Cerrar sesión" className="p-2 rounded-lg text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 transition-colors">
          <LogOut className="w-4 h-4" />
        </button>
      </header>

      <main className="max-w-3xl mx-auto px-4 pt-20 pb-8 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <Card>
            <CardContent className="pt-4 pb-4 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-950 border border-emerald-900 flex items-center justify-center">
                <Users className="w-4 h-4 text-emerald-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{groups.length}</p>
                <p className="text-xs text-zinc-500">Grupos activos</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-4 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center">
                <FlaskConical className="w-4 h-4 text-zinc-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{groups.reduce((a, g) => a + g._count.simulations, 0)}</p>
                <p className="text-xs text-zinc-500">Simulaciones</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Groups list */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-zinc-500 uppercase tracking-wide">Grupos · {groups.length}</p>
            <Button size="sm" onClick={() => { setForm({ name: '', course: 'S2A', plant: 'Lechuga' }); setShowCreate(true) }}>
              <Plus className="w-3.5 h-3.5" /> Nuevo grupo
            </Button>
          </div>

          {groups.length === 0 ? (
            <EmptyState
              icon={<Users className="w-10 h-10" />}
              title="Sin grupos todavía"
              description="Crea el primer grupo para que los estudiantes puedan comenzar."
              action={<Button size="sm" onClick={() => setShowCreate(true)}><Plus className="w-3.5 h-3.5" /> Crear grupo</Button>}
            />
          ) : (
            <div className="space-y-2">
              {groups.map(g => (
                <Card key={g.id} className="group">
                  <CardContent className="pt-4 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center flex-shrink-0">
                        <Sprout className="w-4 h-4 text-zinc-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-medium text-white">{g.name}</p>
                          <Badge variant="default">{g.course}</Badge>
                          <Badge variant="green">{g.plant}</Badge>
                        </div>
                        <div className="flex items-center gap-3 mt-1.5 text-xs text-zinc-600">
                          <span>{g._count.simulations} simulación{g._count.simulations !== 1 ? 'es' : ''}</span>
                          <span>{g._count.members} integrante{g._count.members !== 1 ? 's' : ''}</span>
                          <button onClick={() => copyCode(g.code)} className="flex items-center gap-1 font-mono text-zinc-500 hover:text-zinc-300 transition-colors">
                            {copied === g.code ? <CheckCheck className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                            {g.code}
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button onClick={() => router.push(`/grupo/${g.id}`)} className="p-1.5 rounded-lg text-zinc-600 hover:text-zinc-300 hover:bg-zinc-800 transition-colors">
                          <ChevronRight className="w-4 h-4" />
                        </button>
                        <button onClick={() => openEdit(g)} className="p-1.5 rounded-lg text-zinc-600 hover:text-zinc-300 hover:bg-zinc-800 transition-colors">
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => setDeleteId(g.id)} className="p-1.5 rounded-lg text-zinc-600 hover:text-red-400 hover:bg-red-950/30 transition-colors">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>
      </main>

      <footer className="relative z-10 text-center py-6 text-zinc-700 text-xs">
        Ing. Abraham CG &mdash; 2026 · All rights reserved
      </footer>

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Nuevo grupo">
        <GroupForm form={form} setForm={setForm} onCancel={() => setShowCreate(false)} onSave={createGroup} saving={saving} />
      </Modal>

      <Modal open={!!editGroup} onClose={() => setEditGroup(null)} title="Editar grupo">
        <GroupForm form={form} setForm={setForm} onCancel={() => setEditGroup(null)} onSave={updateGroup} saving={saving} />
      </Modal>

      <Modal open={!!deleteId} onClose={() => setDeleteId(null)} title="Eliminar grupo">
        <div className="space-y-4">
          <p className="text-sm text-zinc-400">¿Eliminar este grupo? Se perderán todas sus simulaciones y datos. Esta acción no se puede deshacer.</p>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setDeleteId(null)} className="flex-1">Cancelar</Button>
            <Button variant="destructive" onClick={deleteGroup} className="flex-1">Eliminar</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
