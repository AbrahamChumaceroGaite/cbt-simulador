'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { FlaskConical, ChevronRight, Lock, LockOpen, Trash2, Pencil } from 'lucide-react'
import type { GroupResponse, SimulationResponse } from '@simulador/shared'
import { Button, Card, CardContent, Input, Label, Modal, Badge, EmptyState, Tooltip, Pagination, Combobox, Checkbox } from '@/components/ui'
import { SectionHeader } from '@/components/shared'
import { simulationsService } from '@/services/simulations.service'

interface Props {
  simulations: SimulationResponse[]
  groups:      GroupResponse[]
  onReload:    () => void
  showToast:   (msg: string, ok?: boolean) => void
}

export function AdminSimulationsSection({ simulations, groups, onReload, showToast }: Props) {
  const router = useRouter()
  const [page, setPage]         = useState(0)
  const [pageSize, setPageSize] = useState(5)
  const [search, setSearch]     = useState('')
  const [course, setCourse]     = useState('')
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [toggling, setToggling] = useState<string | null>(null)
  const [editSim, setEditSim]   = useState<SimulationResponse | null>(null)
  const [editName, setEditName] = useState('')
  const [saving, setSaving]     = useState(false)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [bulkDeleting, setBulkDeleting]       = useState(false)
  const [showBulkConfirm, setShowBulkConfirm] = useState(false)

  const courses = Array.from(new Set(groups.map(g => g.course))).sort()

  function openEdit(sim: SimulationResponse) {
    setEditName(sim.name)
    setEditSim(sim)
  }

  async function saveEdit() {
    if (!editSim || !editName.trim()) return
    setSaving(true)
    try {
      const { message } = await simulationsService.update(editSim.id, { name: editName.trim() })
      showToast(message)
      setEditSim(null); onReload()
    } catch (err: any) { showToast(err.message ?? 'Error', false) }
    finally { setSaving(false) }
  }

  async function confirmDelete() {
    if (!deleteId) return
    try {
      await simulationsService.delete(deleteId)
      showToast('Simulación eliminada')
      setDeleteId(null); onReload()
    } catch (err: any) { showToast(err.message ?? 'Error', false) }
  }

  async function confirmBulkDelete() {
    setBulkDeleting(true)
    try {
      await Promise.all(Array.from(selected).map(id => simulationsService.delete(id)))
      showToast(`${selected.size} simulaciones eliminadas`)
      setSelected(new Set()); setShowBulkConfirm(false); onReload()
    } catch (err: any) { showToast(err.message ?? 'Error', false) }
    finally { setBulkDeleting(false) }
  }

  async function toggleLock(sim: SimulationResponse) {
    setToggling(sim.id)
    try {
      const { message } = await simulationsService.update(sim.id, { isLocked: !sim.isLocked })
      showToast(message); onReload()
    } catch (err: any) { showToast(err.message ?? 'Error', false) }
    finally { setToggling(null) }
  }

  function toggleSelect(id: string) {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const groupCourse: Record<string, string> = {}
  groups.forEach(g => { groupCourse[g.id] = g.course })

  const q        = search.toLowerCase()
  const filtered = simulations.filter(s => {
    if (course && groupCourse[s.groupId] !== course) return false
    if (!q) return true
    return s.name.toLowerCase().includes(q) || s.group?.name.toLowerCase().includes(q) || (s.plantName ?? '').toLowerCase().includes(q)
  })
  const paged = filtered.slice(page * pageSize, (page + 1) * pageSize)

  const allPageSelected = paged.length > 0 && paged.every(s => selected.has(s.id))

  function togglePageSelect() {
    if (allPageSelected) {
      setSelected(prev => { const n = new Set(prev); paged.forEach(s => n.delete(s.id)); return n })
    } else {
      setSelected(prev => { const n = new Set(prev); paged.forEach(s => n.add(s.id)); return n })
    }
  }

  const courseOptions = [
    { value: '', label: 'Todos los cursos' },
    ...courses.map(c => ({ value: c, label: c })),
  ]

  const CourseFilter = courses.length > 0 ? (
    <Combobox
      value={course}
      onChange={v => { setCourse(v); setPage(0) }}
      options={courseOptions}
      size="sm"
      className="w-44"
    />
  ) : null

  return (
    <section className="space-y-3 animate-in fade-in duration-300">
      <SectionHeader
        icon={FlaskConical}
        iconClass="text-zinc-400"
        title="Simulaciones"
        subtitle={`${filtered.length} de ${simulations.length} simulaciones`}
        search={search}
        onSearch={v => { setSearch(v); setPage(0) }}
        filters={CourseFilter ?? undefined}
      />

      {/* Bulk action bar */}
      {selected.size > 0 && (
        <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-zinc-800/80 border border-zinc-700">
          <span className="text-xs text-zinc-400">{selected.size} seleccionada{selected.size !== 1 ? 's' : ''}</span>
          <div className="flex-1" />
          <Button variant="outline" size="sm" onClick={() => setSelected(new Set())}>Limpiar</Button>
          <Button variant="destructive" size="sm" onClick={() => setShowBulkConfirm(true)}>
            <Trash2 className="w-3.5 h-3.5 mr-1" /> Eliminar {selected.size}
          </Button>
        </div>
      )}

      {filtered.length === 0 ? (
        <EmptyState
          icon={<FlaskConical className="w-10 h-10" />}
          title={search || course ? 'Sin resultados' : 'Sin simulaciones'}
          description={search || course ? 'Prueba con otro filtro.' : 'Los grupos aún no han creado ninguna simulación.'}
        />
      ) : (
        <>
          <div className="flex items-center gap-2 px-1">
            <Checkbox
              checked={allPageSelected}
              onCheckedChange={() => togglePageSelect()}
            />
            <span className="text-xs text-zinc-600">Seleccionar página</span>
          </div>

          <div className="space-y-2">
            {paged.map(sim => (
              <Card key={sim.id} className={selected.has(sim.id) ? 'ring-1 ring-emerald-500/40' : ''}>
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-center gap-3">
                    <Checkbox
                      checked={selected.has(sim.id)}
                      onCheckedChange={() => toggleSelect(sim.id)}
                    />
                    <div className="w-9 h-9 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center flex-shrink-0">
                      <FlaskConical className="w-4 h-4 text-zinc-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-medium text-white truncate">{sim.name}</p>
                        {sim.isLocked && <Badge variant="default">Bloqueada</Badge>}
                        {sim.isDemo   && <Badge variant="green">Demo</Badge>}
                        {groupCourse[sim.groupId] && <Badge variant="default">{groupCourse[sim.groupId]}</Badge>}
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-xs text-zinc-600 flex-wrap">
                        {sim.group && <span className="text-zinc-500">{sim.group.name}</span>}
                        <span>{sim._count?.entries ?? 0} sesión{(sim._count?.entries ?? 0) !== 1 ? 'es' : ''}</span>
                        <span>{sim.plantName}</span>
                        <span className="font-mono">{sim.startYear}/{String(sim.startMonth).padStart(2,'0')}/{String(sim.startDay).padStart(2,'0')}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <Tooltip content="Ver simulación">
                        <button onClick={() => router.push(`/grupo/${sim.groupId}/simulacion/${sim.id}`)}
                          className="p-1.5 rounded-lg text-zinc-600 hover:text-zinc-300 hover:bg-zinc-800 transition-colors">
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </Tooltip>
                      <Tooltip content={sim.isLocked ? 'Desbloquear' : 'Bloquear'}>
                        <button onClick={() => toggleLock(sim)} disabled={toggling === sim.id}
                          className="p-1.5 rounded-lg text-zinc-600 hover:text-zinc-300 hover:bg-zinc-800 transition-colors disabled:opacity-40">
                          {sim.isLocked ? <LockOpen className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                        </button>
                      </Tooltip>
                      <Tooltip content="Renombrar">
                        <button onClick={() => openEdit(sim)}
                          className="p-1.5 rounded-lg text-zinc-600 hover:text-zinc-300 hover:bg-zinc-800 transition-colors">
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                      </Tooltip>
                      <Tooltip content="Eliminar simulación">
                        <button onClick={() => setDeleteId(sim.id)}
                          className="p-1.5 rounded-lg text-zinc-600 hover:text-red-400 hover:bg-red-950/30 transition-colors">
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

      {/* Edit modal — name only */}
      <Modal open={!!editSim} onClose={() => setEditSim(null)} title="Renombrar simulación">
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>Nombre</Label>
            <Input
              value={editName}
              onChange={e => setEditName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && saveEdit()}
              autoFocus
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setEditSim(null)} className="flex-1">Cancelar</Button>
            <Button onClick={saveEdit} disabled={saving || !editName.trim()} loading={saving} className="flex-1">
              Guardar
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete single */}
      <Modal open={!!deleteId} onClose={() => setDeleteId(null)} title="Eliminar simulación">
        <div className="space-y-4">
          <p className="text-sm text-zinc-400">¿Eliminar esta simulación? Se perderán todas sus sesiones y mediciones. Esta acción no se puede deshacer.</p>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setDeleteId(null)} className="flex-1">Cancelar</Button>
            <Button variant="destructive" onClick={confirmDelete} className="flex-1">Eliminar</Button>
          </div>
        </div>
      </Modal>

      {/* Bulk delete */}
      <Modal open={showBulkConfirm} onClose={() => setShowBulkConfirm(false)} title="Eliminar simulaciones">
        <div className="space-y-4">
          <p className="text-sm text-zinc-400">¿Eliminar <strong className="text-white">{selected.size}</strong> simulaciones? Se perderán todas sus sesiones y mediciones. Esta acción no se puede deshacer.</p>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowBulkConfirm(false)} className="flex-1">Cancelar</Button>
            <Button variant="destructive" onClick={confirmBulkDelete} disabled={bulkDeleting} className="flex-1">
              {bulkDeleting ? 'Eliminando…' : `Eliminar ${selected.size}`}
            </Button>
          </div>
        </div>
      </Modal>
    </section>
  )
}
