'use client'
import { useEffect, useState } from 'react'
import { Plus, Shield, Users, Pencil, Trash2 } from 'lucide-react'
import type { UserResponse, CreateUserDto, UpdateUserDto } from '@simulador/shared'
import { Modal, Button, Input, Label, Select, Badge, EmptyState, Tooltip, Pagination } from '@/components/ui'
import { SectionHeader } from '@/components/shared'
import { usersService }   from '@/services/users.service'

interface Props {
  showToast: (msg: string, ok?: boolean) => void
}

const BLANK_CREATE: CreateUserDto = { code: '', password: '', fullName: '', role: 'admin' }
const BLANK_UPDATE: UpdateUserDto = { fullName: '', password: '', isActive: true }

export function UsuariosSection({ showToast }: Props) {
  const [users,      setUsers]      = useState<UserResponse[]>([])
  const [search,     setSearch]     = useState('')
  const [page,       setPage]       = useState(0)
  const [pageSize,   setPageSize]   = useState(10)
  const [showCreate, setShowCreate] = useState(false)
  const [editUser,   setEditUser]   = useState<UserResponse | null>(null)
  const [deleteId,   setDeleteId]   = useState<string | null>(null)
  const [cForm,      setCForm]      = useState<CreateUserDto>(BLANK_CREATE)
  const [uForm,      setUForm]      = useState<UpdateUserDto>(BLANK_UPDATE)
  const [saving,     setSaving]     = useState(false)

  async function load() {
    const data = await usersService.getAll().catch(() => [] as UserResponse[])
    setUsers(data)
  }

  useEffect(() => { load() }, [])

  function openEdit(u: UserResponse) {
    setUForm({ fullName: u.fullName, password: '', isActive: u.isActive })
    setEditUser(u)
  }

  async function createUser() {
    if (!cForm.code.trim() || !cForm.password.trim()) return
    setSaving(true)
    try {
      const { message } = await usersService.create(cForm)
      showToast(message)
      setShowCreate(false); setCForm(BLANK_CREATE); load()
    } catch (err: any) { showToast(err.message ?? 'Error', false) }
    finally { setSaving(false) }
  }

  async function updateUser() {
    if (!editUser) return
    setSaving(true)
    try {
      const dto: UpdateUserDto = { fullName: uForm.fullName, isActive: uForm.isActive }
      if (uForm.password?.trim()) dto.password = uForm.password
      const { message } = await usersService.update(editUser.id, dto)
      showToast(message)
      setEditUser(null); load()
    } catch (err: any) { showToast(err.message ?? 'Error', false) }
    finally { setSaving(false) }
  }

  async function deleteUser() {
    if (!deleteId) return
    try {
      await usersService.remove(deleteId)
      showToast('Usuario eliminado')
      setDeleteId(null); load()
    } catch (err: any) { showToast(err.message ?? 'Error', false) }
  }

  const q        = search.toLowerCase()
  const filtered = users.filter(u =>
    !q || u.code.includes(q) || u.fullName.toLowerCase().includes(q)
  )
  const paged = filtered.slice(page * pageSize, (page + 1) * pageSize)

  return (
    <section className="space-y-3 animate-in fade-in duration-300">
      <SectionHeader
        icon={Shield}
        iconClass="text-violet-400"
        title="Usuarios del Sistema"
        subtitle="Cuentas de acceso al panel administrativo."
        search={search}
        onSearch={v => { setSearch(v); setPage(0) }}
        actions={
          <Tooltip content="Nuevo usuario">
            <Button size="sm" onClick={() => { setCForm(BLANK_CREATE); setShowCreate(true) }}>
              <Plus className="w-3.5 h-3.5" /> Nuevo
            </Button>
          </Tooltip>
        }
      />

      {filtered.length === 0 ? (
        <EmptyState
          icon={<Users className="w-10 h-10" />}
          title="Sin usuarios"
          description="No hay usuarios que coincidan con la búsqueda."
        />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {paged.map(u => (
              <div key={u.id} className="group relative rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 hover:border-zinc-700 transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-violet-500/15 border border-violet-500/30 flex items-center justify-center text-sm font-black text-violet-300 flex-shrink-0">
                    {u.fullName.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{u.fullName}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[11px] font-mono text-zinc-500">{u.code}</span>
                      <Badge variant={u.role === 'admin' ? 'default' : 'green'}>{u.role}</Badge>
                      {!u.isActive && <Badge variant="default">Inactivo</Badge>}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <Tooltip content="Editar">
                    <button onClick={() => openEdit(u)} className="p-1.5 rounded-lg text-zinc-600 hover:text-zinc-300 hover:bg-zinc-800 transition-colors">
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                  </Tooltip>
                  <Tooltip content="Eliminar">
                    <button onClick={() => setDeleteId(u.id)} className="p-1.5 rounded-lg text-zinc-600 hover:text-red-400 hover:bg-red-950/30 transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </Tooltip>
                </div>
              </div>
            ))}
          </div>
          <Pagination
            page={page} totalItems={filtered.length} pageSize={pageSize}
            onPageSizeChange={s => { setPageSize(s); setPage(0) }} onChange={setPage}
          />
        </>
      )}

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Nuevo usuario">
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>Código (login)</Label>
            <Input value={cForm.code} onChange={e => setCForm(p => ({ ...p, code: e.target.value }))} placeholder="ej. admin01" autoFocus />
          </div>
          <div className="space-y-1.5">
            <Label>Nombre completo</Label>
            <Input value={cForm.fullName} onChange={e => setCForm(p => ({ ...p, fullName: e.target.value }))} placeholder="Nombre" />
          </div>
          <div className="space-y-1.5">
            <Label>Rol</Label>
            <Select value={cForm.role} onChange={e => setCForm(p => ({ ...p, role: e.target.value as 'admin' | 'group' }))}>
              <option value="admin">Admin</option>
              <option value="group">Grupo</option>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Contraseña</Label>
            <Input type="password" value={cForm.password} onChange={e => setCForm(p => ({ ...p, password: e.target.value }))} placeholder="••••••••" />
          </div>
          <div className="flex gap-2 pt-1">
            <Button variant="outline" onClick={() => setShowCreate(false)} className="flex-1">Cancelar</Button>
            <Button onClick={createUser} disabled={saving || !cForm.code.trim() || !cForm.password.trim()} className="flex-1">
              {saving ? 'Guardando…' : 'Crear'}
            </Button>
          </div>
        </div>
      </Modal>

      <Modal open={!!editUser} onClose={() => setEditUser(null)} title="Editar usuario">
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>Nombre completo</Label>
            <Input value={uForm.fullName ?? ''} onChange={e => setUForm(p => ({ ...p, fullName: e.target.value }))} autoFocus />
          </div>
          <div className="space-y-1.5">
            <Label>Nueva contraseña <span className="text-zinc-600">(dejar vacío para no cambiar)</span></Label>
            <Input type="password" value={uForm.password ?? ''} onChange={e => setUForm(p => ({ ...p, password: e.target.value }))} placeholder="••••••••" />
          </div>
          <div className="flex items-center gap-2">
            <input
              id="isActive"
              type="checkbox"
              checked={uForm.isActive ?? true}
              onChange={e => setUForm(p => ({ ...p, isActive: e.target.checked }))}
              className="w-4 h-4 rounded accent-emerald-500"
            />
            <Label htmlFor="isActive">Cuenta activa</Label>
          </div>
          <div className="flex gap-2 pt-1">
            <Button variant="outline" onClick={() => setEditUser(null)} className="flex-1">Cancelar</Button>
            <Button onClick={updateUser} disabled={saving} className="flex-1">
              {saving ? 'Guardando…' : 'Guardar'}
            </Button>
          </div>
        </div>
      </Modal>

      <Modal open={!!deleteId} onClose={() => setDeleteId(null)} title="Eliminar usuario">
        <div className="space-y-4">
          <p className="text-sm text-zinc-400">¿Eliminar este usuario? Esta acción no se puede deshacer.</p>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setDeleteId(null)} className="flex-1">Cancelar</Button>
            <Button variant="destructive" onClick={deleteUser} className="flex-1">Eliminar</Button>
          </div>
        </div>
      </Modal>
    </section>
  )
}
