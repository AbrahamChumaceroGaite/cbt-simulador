'use client'
import { useEffect, useState } from 'react'
import { UserPlus } from 'lucide-react'
import { Button, Card, CardContent, Modal, Tooltip } from '@/components/ui'
import { MemberForm } from './MemberForm'

type Member = { id: string; name: string; role: string }

interface MembersSectionProps {
  groupId: string
}

export function MembersSection({ groupId }: MembersSectionProps) {
  const [members, setMembers]           = useState<Member[]>([])
  const [showAdd, setShowAdd]           = useState(false)
  const [editMember, setEditMember]     = useState<Member | null>(null)
  const [deleteMemberId, setDeleteId]   = useState<string | null>(null)
  const [memberForm, setMemberForm]     = useState({ name: '', role: '' })
  const [saving, setSaving]             = useState(false)

  const loadMembers = () =>
    fetch(`/api/members?groupId=${groupId}`).then(r => r.json()).then(setMembers)

  useEffect(() => { loadMembers() }, [groupId])

  function openAdd() { setMemberForm({ name: '', role: '' }); setShowAdd(true) }
  function openEdit(m: Member) { setMemberForm({ name: m.name, role: m.role }); setEditMember(m) }

  async function addMember() {
    if (!memberForm.name.trim()) return
    setSaving(true)
    await fetch('/api/members', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ groupId, name: memberForm.name, role: memberForm.role }),
    })
    setSaving(false); setShowAdd(false); setMemberForm({ name: '', role: '' }); loadMembers()
  }

  async function updateMember() {
    if (!editMember || !memberForm.name.trim()) return
    setSaving(true)
    await fetch(`/api/members/${editMember.id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: memberForm.name, role: memberForm.role }),
    })
    setSaving(false); setEditMember(null); loadMembers()
  }

  async function deleteMember() {
    if (!deleteMemberId) return
    await fetch(`/api/members/${deleteMemberId}`, { method: 'DELETE' })
    setDeleteId(null); loadMembers()
  }

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-zinc-500 uppercase tracking-wide">
          Integrantes {members.length > 0 && `· ${members.length}`}
        </p>
        <Button size="sm" variant="ghost" onClick={openAdd}>
          <UserPlus className="w-3.5 h-3.5" /> Agregar
        </Button>
      </div>

      {members.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="pt-4 pb-4">
            <button onClick={openAdd} className="w-full flex items-center gap-3 text-left group">
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
                  <Tooltip content="Editar integrante">
                    <button onClick={() => openEdit(m)} className="p-1 rounded text-zinc-600 hover:text-zinc-300 hover:bg-zinc-800 transition-colors">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                    </button>
                  </Tooltip>
                  <Tooltip content="Eliminar integrante">
                    <button onClick={() => setDeleteId(m.id)} className="p-1 rounded text-zinc-600 hover:text-red-400 hover:bg-red-950/30 transition-colors">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </Tooltip>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Agregar integrante">
        <MemberForm form={memberForm} setForm={setMemberForm} onCancel={() => setShowAdd(false)} onSave={addMember} saving={saving} />
      </Modal>

      <Modal open={!!editMember} onClose={() => setEditMember(null)} title="Editar integrante">
        <MemberForm form={memberForm} setForm={setMemberForm} onCancel={() => setEditMember(null)} onSave={updateMember} saving={saving} />
      </Modal>

      <Modal open={!!deleteMemberId} onClose={() => setDeleteId(null)} title="Eliminar integrante">
        <div className="space-y-4">
          <p className="text-sm text-zinc-400">¿Eliminar este integrante del grupo?</p>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setDeleteId(null)} className="flex-1">Cancelar</Button>
            <Button variant="destructive" onClick={deleteMember} className="flex-1">Eliminar</Button>
          </div>
        </div>
      </Modal>
    </section>
  )
}
