'use client'
import { useEffect, useState } from 'react'
import { Users, Plus, Pencil, Trash2 } from 'lucide-react'
import type { GroupResponse, MemberResponse } from '@simulador/shared'
import { Button, Card, CardContent, Modal, Input, Label, EmptyState, Tooltip, Pagination, Combobox } from '@/components/ui'
import { SectionHeader } from '@/components/shared'
import { membersService } from '@/services/members.service'

interface Props {
  groups:    GroupResponse[]
  showToast: (msg: string, ok?: boolean) => void
}

const ROLES = ['Líder', 'Observador', 'Responsable de riego', 'Fotógrafo', 'Analista', 'Integrante']

export function AdminMembersSection({ groups, showToast }: Props) {
  const [selectedGroupId, setSelectedGroupId] = useState<string>(groups[0]?.id ?? '')
  const [members, setMembers]   = useState<MemberResponse[]>([])
  const [loading, setLoading]   = useState(false)
  const [search, setSearch]     = useState('')
  const [page, setPage]         = useState(0)
  const [pageSize, setPageSize] = useState(5)

  const [showCreate, setShowCreate] = useState(false)
  const [editMember, setEditMember] = useState<MemberResponse | null>(null)
  const [deleteId, setDeleteId]     = useState<string | null>(null)
  const [form, setForm]             = useState({ name: '', role: 'Integrante' })
  const [saving, setSaving]         = useState(false)

  async function loadMembers(groupId: string) {
    if (!groupId) return
    setLoading(true)
    const data = await membersService.getByGroup(groupId)
    setMembers(data)
    setPage(0)
    setLoading(false)
  }

  useEffect(() => { if (selectedGroupId) loadMembers(selectedGroupId) }, [selectedGroupId])
  useEffect(() => { if (groups.length > 0 && !selectedGroupId) setSelectedGroupId(groups[0].id) }, [groups])

  function openCreate() { setForm({ name: '', role: 'Integrante' }); setShowCreate(true) }
  function openEdit(m: MemberResponse) { setForm({ name: m.name, role: m.role }); setEditMember(m) }

  async function createMember() {
    if (!form.name.trim() || !selectedGroupId) return
    setSaving(true)
    try {
      const { message } = await membersService.create({ ...form, groupId: selectedGroupId })
      showToast(message)
      setShowCreate(false); await loadMembers(selectedGroupId)
    } catch (err: any) { showToast(err.message ?? 'Error', false) }
    finally { setSaving(false) }
  }

  async function updateMember() {
    if (!editMember || !form.name.trim()) return
    setSaving(true)
    try {
      const { message } = await membersService.update(editMember.id, form)
      showToast(message)
      setEditMember(null); await loadMembers(selectedGroupId)
    } catch (err: any) { showToast(err.message ?? 'Error', false) }
    finally { setSaving(false) }
  }

  async function confirmDelete() {
    if (!deleteId) return
    try {
      await membersService.delete(deleteId)
      showToast('Integrante eliminado')
      setDeleteId(null); await loadMembers(selectedGroupId)
    } catch (err: any) { showToast(err.message ?? 'Error', false) }
  }

  const q        = search.toLowerCase()
  const filtered = members.filter(m => !q || m.name.toLowerCase().includes(q))
  const paged    = filtered.slice(page * pageSize, (page + 1) * pageSize)

  const groupOptions = groups.map(g => ({ value: g.id, label: `${g.name} (${g.course})` }))
  const GroupFilter = (
    <Combobox value={selectedGroupId} onChange={setSelectedGroupId} options={groupOptions} size="sm" className="w-52" />
  )

  return (
    <section className="space-y-3 animate-in fade-in duration-300">
      <SectionHeader
        icon={Users}
        iconClass="text-zinc-400"
        title="Integrantes"
        subtitle={`${members.length} integrantes en el grupo seleccionado`}
        search={search}
        onSearch={v => { setSearch(v); setPage(0) }}
        filters={GroupFilter}
        actions={
          <Tooltip content="Nuevo integrante">
            <Button size="sm" onClick={openCreate} disabled={!selectedGroupId}>
              <Plus className="w-3.5 h-3.5" /> Nuevo
            </Button>
          </Tooltip>
        }
      />

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="w-5 h-5 rounded-full border-2 border-zinc-700 border-t-emerald-400 animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<Users className="w-10 h-10" />}
          title={search ? 'Sin resultados' : 'Sin integrantes'}
          description={search ? 'Prueba con otro nombre.' : 'Este grupo aún no tiene integrantes registrados.'}
          action={!search ? <Button size="sm" onClick={openCreate}><Plus className="w-3.5 h-3.5" /> Agregar</Button> : undefined}
        />
      ) : (
        <>
          <div className="space-y-2">
            {paged.map(m => (
              <Card key={m.id} className="group">
                <CardContent className="pt-3 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-xs font-bold text-zinc-400 flex-shrink-0">
                      {m.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white">{m.name}</p>
                      <p className="text-xs text-zinc-500">{m.role}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Tooltip content="Editar">
                        <button onClick={() => openEdit(m)} className="p-1.5 rounded-lg text-zinc-600 hover:text-zinc-300 hover:bg-zinc-800 transition-colors">
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                      </Tooltip>
                      <Tooltip content="Eliminar">
                        <button onClick={() => setDeleteId(m.id)} className="p-1.5 rounded-lg text-zinc-600 hover:text-red-400 hover:bg-red-950/30 transition-colors">
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

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Nuevo integrante">
        <MemberForm form={form} setForm={setForm} onCancel={() => setShowCreate(false)} onSave={createMember} saving={saving} />
      </Modal>
      <Modal open={!!editMember} onClose={() => setEditMember(null)} title="Editar integrante">
        <MemberForm form={form} setForm={setForm} onCancel={() => setEditMember(null)} onSave={updateMember} saving={saving} />
      </Modal>
      <Modal open={!!deleteId} onClose={() => setDeleteId(null)} title="Eliminar integrante">
        <div className="space-y-4">
          <p className="text-sm text-zinc-400">¿Eliminar este integrante? Esta acción no se puede deshacer.</p>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setDeleteId(null)} className="flex-1">Cancelar</Button>
            <Button variant="destructive" onClick={confirmDelete} className="flex-1">Eliminar</Button>
          </div>
        </div>
      </Modal>
    </section>
  )
}

function MemberForm({
  form, setForm, onCancel, onSave, saving
}: {
  form:    { name: string; role: string }
  setForm: (f: (p: { name: string; role: string }) => { name: string; role: string }) => void
  onCancel: () => void
  onSave:   () => void
  saving:   boolean
}) {
  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label>Nombre</Label>
        <Input
          placeholder="Ej: Juan Pérez"
          value={form.name}
          onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
          onKeyDown={e => e.key === 'Enter' && onSave()}
          autoFocus
        />
      </div>
      <div className="space-y-1.5">
        <Label>Rol</Label>
        <Combobox
          value={form.role}
          onChange={v => setForm(p => ({ ...p, role: v }))}
          options={ROLES.map(r => ({ value: r, label: r }))}
        />
      </div>
      <div className="flex gap-2 pt-1">
        <Button variant="outline" onClick={onCancel} className="flex-1">Cancelar</Button>
        <Button onClick={onSave} disabled={saving || !form.name.trim()} className="flex-1">
          {saving ? 'Guardando...' : 'Guardar'}
        </Button>
      </div>
    </div>
  )
}
