'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Sprout, Plus, Pencil, Trash2, ChevronRight, Users, Copy, CheckCheck } from 'lucide-react'
import { Button, Card, CardContent, Modal, Badge, EmptyState, Tooltip, Pagination } from '@/components/ui'
import { GroupForm } from './GroupForm'

type Group = {
  id: string; name: string; course: string; plant: string; code: string
  _count: { simulations: number; members: number }
  createdAt: string
}

interface AdminGroupsSectionProps {
  groups: Group[]
  onReload: () => void
}

export function AdminGroupsSection({ groups, onReload }: AdminGroupsSectionProps) {
  const router = useRouter()
  const [page, setPage]             = useState(0)
  const [pageSize, setPageSize]     = useState(10)
  const [copied, setCopied]         = useState<string | null>(null)
  const [showCreate, setShowCreate] = useState(false)
  const [editGroup, setEditGroup]   = useState<Group | null>(null)
  const [deleteId, setDeleteId]     = useState<string | null>(null)
  const [form, setForm]             = useState({ name: '', course: 'S2A', plant: 'Lechuga' })
  const [saving, setSaving]         = useState(false)

  function copyCode(code: string) {
    navigator.clipboard.writeText(code).then(() => { setCopied(code); setTimeout(() => setCopied(null), 2000) })
  }

  function openEdit(g: Group) {
    setForm({ name: g.name, course: g.course, plant: g.plant }); setEditGroup(g)
  }

  async function createGroup() {
    if (!form.name.trim()) return
    setSaving(true)
    await fetch('/api/groups', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    setSaving(false); setShowCreate(false); setForm({ name: '', course: 'S2A', plant: 'Lechuga' }); onReload()
  }

  async function updateGroup() {
    if (!editGroup || !form.name.trim()) return
    setSaving(true)
    await fetch(`/api/groups/${editGroup.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    setSaving(false); setEditGroup(null); onReload()
  }

  async function deleteGroup() {
    if (!deleteId) return
    await fetch(`/api/groups/${deleteId}`, { method: 'DELETE' })
    setDeleteId(null); onReload()
  }

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-zinc-500 uppercase tracking-wide">Grupos · {groups.length}</p>
        <Tooltip content="Nuevo grupo" side="bottom">
          <Button size="sm" onClick={() => { setForm({ name: '', course: 'S2A', plant: 'Lechuga' }); setShowCreate(true) }}>
            <Plus className="w-3.5 h-3.5" /> Nuevo grupo
          </Button>
        </Tooltip>
      </div>

      {groups.length === 0 ? (
        <EmptyState
          icon={<Users className="w-10 h-10" />}
          title="Sin grupos todavía"
          description="Crea el primer grupo para que los estudiantes puedan comenzar."
          action={<Button size="sm" onClick={() => setShowCreate(true)}><Plus className="w-3.5 h-3.5" /> Crear grupo</Button>}
        />
      ) : (
        <>
          <div className="space-y-2">
            {groups.slice(page * pageSize, (page + 1) * pageSize).map(g => (
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
                        <Tooltip content="Copiar código de acceso" side="bottom">
                          <button onClick={() => copyCode(g.code)} className="flex items-center gap-1 font-mono text-zinc-500 hover:text-zinc-300 transition-colors">
                            {copied === g.code ? <CheckCheck className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                            {g.code}
                          </button>
                        </Tooltip>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Tooltip content="Ver grupo">
                        <button onClick={() => router.push(`/grupo/${g.id}`)} className="p-1.5 rounded-lg text-zinc-600 hover:text-zinc-300 hover:bg-zinc-800 transition-colors">
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </Tooltip>
                      <Tooltip content="Editar grupo">
                        <button onClick={() => openEdit(g)} className="p-1.5 rounded-lg text-zinc-600 hover:text-zinc-300 hover:bg-zinc-800 transition-colors">
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                      </Tooltip>
                      <Tooltip content="Eliminar grupo">
                        <button onClick={() => setDeleteId(g.id)} className="p-1.5 rounded-lg text-zinc-600 hover:text-red-400 hover:bg-red-950/30 transition-colors">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </Tooltip>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <Pagination page={page} totalItems={groups.length} pageSize={pageSize}
            onPageSizeChange={s => { setPageSize(s); setPage(0) }} onChange={setPage} />
        </>
      )}

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
    </section>
  )
}
