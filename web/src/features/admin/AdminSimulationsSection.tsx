'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { FlaskConical, ChevronRight, Lock, LockOpen, Trash2, Pencil } from 'lucide-react'
import type { GroupResponse, SimulationResponse } from '@simulador/shared'
import { Button, Card, CardContent, Input, Label, Modal, Select, Badge, EmptyState, Tooltip, Pagination } from '@/components/ui'
// Edit is name-only — full param editing happens inside the simulation detail page
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
  const [pageSize, setPageSize] = useState(10)
  const [search, setSearch]     = useState('')
  const [course, setCourse]     = useState('')
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [toggling, setToggling] = useState<string | null>(null)
  const [editSim, setEditSim]   = useState<SimulationResponse | null>(null)
  const [editName, setEditName] = useState('')
  const [saving, setSaving]     = useState(false)

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

  async function toggleLock(sim: SimulationResponse) {
    setToggling(sim.id)
    try {
      const { message } = await simulationsService.update(sim.id, { isLocked: !sim.isLocked })
      showToast(message); onReload()
    } catch (err: any) { showToast(err.message ?? 'Error', false) }
    finally { setToggling(null) }
  }

  // Derive group course lookup
  const groupCourse: Record<string, string> = {}
  groups.forEach(g => { groupCourse[g.id] = g.course })

  const q        = search.toLowerCase()
  const filtered = simulations.filter(s => {
    if (course && groupCourse[s.groupId] !== course) return false
    if (!q) return true
    return s.name.toLowerCase().includes(q) || s.group?.name.toLowerCase().includes(q) || (s.plantName ?? '').toLowerCase().includes(q)
  })
  const paged = filtered.slice(page * pageSize, (page + 1) * pageSize)

  const CourseFilter = courses.length > 0 ? (
    <Select value={course} onChange={e => { setCourse(e.target.value); setPage(0) }} className="text-xs h-8">
      <option value="">Todos los cursos</option>
      {courses.map(c => <option key={c} value={c}>{c}</option>)}
    </Select>
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

      {filtered.length === 0 ? (
        <EmptyState
          icon={<FlaskConical className="w-10 h-10" />}
          title={search || course ? 'Sin resultados' : 'Sin simulaciones'}
          description={search || course ? 'Prueba con otro filtro.' : 'Los grupos aún no han creado ninguna simulación.'}
        />
      ) : (
        <>
          <div className="space-y-2">
            {paged.map(sim => (
              <Card key={sim.id}>
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-center gap-3">
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
                        <button onClick={() => sim.group && router.push(`/grupo/${sim.groupId}/simulacion/${sim.id}`)}
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
                      <Tooltip content="Editar simulación">
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

      {/* Edit modal — name only; full params are edited inside the simulation detail page */}
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
            <Button onClick={saveEdit} disabled={saving || !editName.trim()} className="flex-1">
              {saving ? 'Guardando…' : 'Guardar'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete modal */}
      <Modal open={!!deleteId} onClose={() => setDeleteId(null)} title="Eliminar simulación">
        <div className="space-y-4">
          <p className="text-sm text-zinc-400">¿Eliminar esta simulación? Se perderán todas sus sesiones y mediciones. Esta acción no se puede deshacer.</p>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setDeleteId(null)} className="flex-1">Cancelar</Button>
            <Button variant="destructive" onClick={confirmDelete} className="flex-1">Eliminar</Button>
          </div>
        </div>
      </Modal>
    </section>
  )
}
