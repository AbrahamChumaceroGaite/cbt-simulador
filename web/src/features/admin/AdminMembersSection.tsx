'use client'
import { useEffect, useState } from 'react'
import { Users, Plus, Pencil, Trash2 } from 'lucide-react'
import type { GroupResponse, MemberResponse } from '@simulador/shared'
import { Button, Card, CardContent, Modal, Input, Label, Select, EmptyState, Tooltip, Pagination } from '@/components/ui'
import { membersService } from '@/services/members.service'

interface AdminMembersSectionProps {
  groups: GroupResponse[]
}

const ROLES = ['Líder', 'Observador', 'Responsable de riego', 'Fotógrafo', 'Analista', 'Integrante']

export function AdminMembersSection({ groups }: AdminMembersSectionProps) {
  const [selectedGroupId, setSelectedGroupId] = useState<string>(groups[0]?.id ?? '')
  const [members, setMembers]   = useState<MemberResponse[]>([])
  const [loading, setLoading]   = useState(false)
  const [page, setPage]         = useState(0)
  const [pageSize, setPageSize] = useState(10)

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

  useEffect(() => {
    if (selectedGroupId) loadMembers(selectedGroupId)
  }, [selectedGroupId])

  useEffect(() => {
    if (groups.length > 0 && !selectedGroupId) setSelectedGroupId(groups[0].id)
  }, [groups])

  function openCreate() { setForm({ name: '', role: 'Integrante' }); setShowCreate(true) }
  function openEdit(m: MemberResponse) { setForm({ name: m.name, role: m.role }); setEditMember(m) }

  async function createMember() {
    if (!form.name.trim() || !selectedGroupId) return
    setSaving(true)
    await membersService.create({ ...form, groupId: selectedGroupId })
    setSaving(false); setShowCreate(false)
    await loadMembers(selectedGroupId)
  }

  async function updateMember() {
    if (!editMember || !form.name.trim()) return
    setSaving(true)
    await membersService.update(editMember.id, form)
    setSaving(false); setEditMember(null)
    await loadMembers(selectedGroupId)
  }

  async function confirmDelete() {
    if (!deleteId) return
    await membersService.delete(deleteId)
    setDeleteId(null)
    await loadMembers(selectedGroupId)
  }

  const paged = members.slice(page * pageSize, (page + 1) * pageSize)

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <p className="text-xs font-medium text-zinc-500 uppercase tracking-wide">
          Integrantes · {members.length}
        </p>
        <div className="flex items-center gap-2">
          <Select
            value={selectedGroupId}
            onChange={e => setSelectedGroupId(e.target.value)}
            className="text-xs"
          >
            {groups.map(g => (
              <option key={g.id} value={g.id}>{g.name} ({g.course})</option>
            ))}
          </Select>
          <Button size="sm" onClick={openCreate} disabled={!selectedGroupId}>
            <Plus className="w-3.5 h-3.5" /> Nuevo
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="w-5 h-5 rounded-full border-2 border-zinc-700 border-t-emerald-400 animate-spin" />
        </div>
      ) : members.length === 0 ? (
        <EmptyState
          icon={<Users className="w-10 h-10" />}
          title="Sin integrantes"
          description="Este grupo aún no tiene integrantes registrados."
          action={<Button size="sm" onClick={openCreate}><Plus className="w-3.5 h-3.5" /> Agregar</Button>}
        />
      ) : (
        <>
          <div className="space-y-2">
            {paged.map(m => (
              <Card key={m.id}>
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
                        <button
                          onClick={() => openEdit(m)}
                          className="p-1.5 rounded-lg text-zinc-600 hover:text-zinc-300 hover:bg-zinc-800 transition-colors"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                      </Tooltip>
                      <Tooltip content="Eliminar">
                        <button
                          onClick={() => setDeleteId(m.id)}
                          className="p-1.5 rounded-lg text-zinc-600 hover:text-red-400 hover:bg-red-950/30 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </Tooltip>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <Pagination
            page={page}
            totalItems={members.length}
            pageSize={pageSize}
            onPageSizeChange={s => { setPageSize(s); setPage(0) }}
            onChange={setPage}
          />
        </>
      )}

      {/* Create modal */}
      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Nuevo integrante">
        <MemberForm form={form} setForm={setForm} onCancel={() => setShowCreate(false)} onSave={createMember} saving={saving} />
      </Modal>

      {/* Edit modal */}
      <Modal open={!!editMember} onClose={() => setEditMember(null)} title="Editar integrante">
        <MemberForm form={form} setForm={setForm} onCancel={() => setEditMember(null)} onSave={updateMember} saving={saving} />
      </Modal>

      {/* Delete modal */}
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
  form: { name: string; role: string }
  setForm: (f: (p: { name: string; role: string }) => { name: string; role: string }) => void
  onCancel: () => void
  onSave: () => void
  saving: boolean
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
        <Select value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value }))}>
          {ROLES.map(r => <option key={r}>{r}</option>)}
        </Select>
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
