'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Sprout, Plus, ChevronRight, Copy, CheckCheck, Users, Pencil, Trash2 } from 'lucide-react'
import type { GroupResponse } from '@simulador/shared'
import { Button, Card, CardContent, Modal, Badge, EmptyState, Tooltip, Pagination, Select } from '@/components/ui'
import { SectionHeader } from '@/components/shared'
import { groupsService } from '@/services/groups.service'
import { GroupForm }     from './GroupForm'

type Group = GroupResponse

interface Props {
  groups:    Group[]
  onReload:  () => void
  showToast: (msg: string, ok?: boolean) => void
}

export function AdminGroupsSection({ groups, onReload, showToast }: Props) {
  const router = useRouter()
  const [page, setPage]             = useState(0)
  const [pageSize, setPageSize]     = useState(10)
  const [search, setSearch]         = useState('')
  const [course, setCourse]         = useState('')
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
    try {
      const { message } = await groupsService.create(form)
      showToast(message)
      setShowCreate(false); setForm({ name: '', course: 'S2A', plant: 'Lechuga' }); onReload()
    } catch (err: any) { showToast(err.message ?? 'Error', false) }
    finally { setSaving(false) }
  }

  async function updateGroup() {
    if (!editGroup || !form.name.trim()) return
    setSaving(true)
    try {
      const { message } = await groupsService.update(editGroup.id, form)
      showToast(message)
      setEditGroup(null); onReload()
    } catch (err: any) { showToast(err.message ?? 'Error', false) }
    finally { setSaving(false) }
  }

  async function deleteGroup() {
    if (!deleteId) return
    try {
      await groupsService.delete(deleteId)
      showToast('Grupo eliminado')
      setDeleteId(null); onReload()
    } catch (err: any) { showToast(err.message ?? 'Error', false) }
  }

  const courses  = Array.from(new Set(groups.map(g => g.course))).sort()
  const q        = search.toLowerCase()
  const filtered = groups.filter(g => {
    if (course && g.course !== course) return false
    if (!q) return true
    return g.name.toLowerCase().includes(q) || g.code.toLowerCase().includes(q)
  })
  const paged    = filtered.slice(page * pageSize, (page + 1) * pageSize)

  const CourseFilter = courses.length > 0 ? (
    <Select value={course} onChange={e => { setCourse(e.target.value); setPage(0) }} className="text-xs h-8">
      <option value="">Todos los cursos</option>
      {courses.map(c => <option key={c} value={c}>{c}</option>)}
    </Select>
  ) : null

  return (
    <section className="space-y-3 animate-in fade-in duration-300">
      <SectionHeader
        icon={Users}
        iconClass="text-emerald-400"
        title="Grupos"
        subtitle={`${filtered.length} de ${groups.length} grupos`}
        search={search}
        onSearch={v => { setSearch(v); setPage(0) }}
        filters={CourseFilter ?? undefined}
        actions={
          <Tooltip content="Nuevo grupo">
            <Button size="sm" onClick={() => { setForm({ name: '', course: 'S2A', plant: 'Lechuga' }); setShowCreate(true) }}>
              <Plus className="w-3.5 h-3.5" /> Nuevo
            </Button>
          </Tooltip>
        }
      />

      {filtered.length === 0 ? (
        <EmptyState
          icon={<Users className="w-10 h-10" />}
          title={search ? 'Sin resultados' : 'Sin grupos todavía'}
          description={search ? 'Prueba con otro término.' : 'Crea el primer grupo para que los estudiantes puedan comenzar.'}
          action={!search ? <Button size="sm" onClick={() => setShowCreate(true)}><Plus className="w-3.5 h-3.5" /> Crear grupo</Button> : undefined}
        />
      ) : (
        <>
          <div className="space-y-2">
            {paged.map(g => (
              <Card key={g.id} className="group">
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center flex-shrink-0">
                      <Sprout className="w-4 h-4 text-emerald-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-medium text-white">{g.name}</p>
                        <Badge variant="default">{g.course}</Badge>
                        <Badge variant="green">{g.plant}</Badge>
                      </div>
                      <div className="flex items-center gap-3 mt-1.5 text-xs text-zinc-600">
                        <span>{g._count?.simulations ?? 0} simulación{(g._count?.simulations ?? 0) !== 1 ? 'es' : ''}</span>
                        <span>{g._count?.members ?? 0} integrante{(g._count?.members ?? 0) !== 1 ? 's' : ''}</span>
                        <Tooltip content="Copiar código de acceso" side="bottom">
                          <button onClick={() => copyCode(g.code)} className="flex items-center gap-1 font-mono text-zinc-500 hover:text-zinc-300 transition-colors">
                            {copied === g.code ? <CheckCheck className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                            {g.code}
                          </button>
                        </Tooltip>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
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
          <Pagination page={page} totalItems={filtered.length} pageSize={pageSize}
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
