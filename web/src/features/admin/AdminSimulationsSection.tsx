'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { FlaskConical, ChevronRight, Lock, LockOpen, Trash2, Pencil } from 'lucide-react'
import type { GroupResponse, SimulationResponse, SimulationUpdateInput } from '@simulador/shared'
import { Button, Card, CardContent, Input, Label, Modal, Select, Badge, EmptyState, Tooltip, Pagination } from '@/components/ui'
import { SectionHeader } from '@/components/shared'
import { simulationsService } from '@/services/simulations.service'

interface Props {
  simulations: SimulationResponse[]
  groups:      GroupResponse[]
  onReload:    () => void
  showToast:   (msg: string, ok?: boolean) => void
}

type EditForm = {
  name:               string
  description:        string
  plantName:          string
  initialHeight:      string
  baseGrowth:         string
  optimalTemp:        string
  optimalHumidity:    string
  optimalLight:       string
  officialPrediction: string
  predictionNote:     string
  startMonth:         string
  startYear:          string
  startDay:           string
  projDays:           string
}

function simToForm(sim: SimulationResponse): EditForm {
  return {
    name:               sim.name,
    description:        sim.description ?? '',
    plantName:          sim.plantName ?? '',
    initialHeight:      String(sim.initialHeight),
    baseGrowth:         String(sim.baseGrowth),
    optimalTemp:        String(sim.optimalTemp),
    optimalHumidity:    String(sim.optimalHumidity),
    optimalLight:       String(sim.optimalLight),
    officialPrediction: sim.officialPrediction != null ? String(sim.officialPrediction) : '',
    predictionNote:     sim.predictionNote ?? '',
    startMonth:         String(sim.startMonth),
    startYear:          String(sim.startYear),
    startDay:           String(sim.startDay),
    projDays:           String(sim.projDays),
  }
}

function n(v: string): number | undefined {
  const x = parseFloat(v); return isNaN(x) ? undefined : x
}

const MONTHS = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']

export function AdminSimulationsSection({ simulations, groups, onReload, showToast }: Props) {
  const router = useRouter()
  const [page, setPage]         = useState(0)
  const [pageSize, setPageSize] = useState(10)
  const [search, setSearch]     = useState('')
  const [course, setCourse]     = useState('')
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [toggling, setToggling] = useState<string | null>(null)
  const [editSim, setEditSim]   = useState<SimulationResponse | null>(null)
  const [form, setForm]         = useState<EditForm | null>(null)
  const [saving, setSaving]     = useState(false)

  const courses = Array.from(new Set(groups.map(g => g.course))).sort()

  function openEdit(sim: SimulationResponse) {
    setForm(simToForm(sim))
    setEditSim(sim)
  }

  async function saveEdit() {
    if (!editSim || !form) return
    setSaving(true)
    try {
      const dto: SimulationUpdateInput = {
        name:               form.name,
        description:        form.description,
        plantName:          form.plantName,
        initialHeight:      n(form.initialHeight),
        baseGrowth:         n(form.baseGrowth),
        optimalTemp:        n(form.optimalTemp),
        optimalHumidity:    n(form.optimalHumidity),
        optimalLight:       n(form.optimalLight),
        officialPrediction: form.officialPrediction !== '' ? n(form.officialPrediction) : null,
        predictionNote:     form.predictionNote,
        startMonth:         n(form.startMonth),
        startYear:          n(form.startYear),
        startDay:           n(form.startDay),
        projDays:           n(form.projDays),
      }
      const { message } = await simulationsService.update(editSim.id, dto)
      showToast(message)
      setEditSim(null); setForm(null); onReload()
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

      {/* Edit modal */}
      <Modal open={!!editSim} onClose={() => { setEditSim(null); setForm(null) }} title="Editar simulación" lg>
        {form && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 space-y-1.5">
                <Label>Nombre</Label>
                <Input value={form.name} onChange={e => setForm(p => p && ({ ...p, name: e.target.value }))} autoFocus />
              </div>
              <div className="col-span-2 space-y-1.5">
                <Label>Descripción</Label>
                <Input value={form.description} onChange={e => setForm(p => p && ({ ...p, description: e.target.value }))} placeholder="Opcional" />
              </div>
              <div className="space-y-1.5">
                <Label>Nombre de planta</Label>
                <Input value={form.plantName} onChange={e => setForm(p => p && ({ ...p, plantName: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label>Días proyectados</Label>
                <Input type="number" value={form.projDays} onChange={e => setForm(p => p && ({ ...p, projDays: e.target.value }))} />
              </div>
            </div>

            <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest pt-1">Fecha de inicio</p>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label>Mes</Label>
                <Select value={form.startMonth} onChange={e => setForm(p => p && ({ ...p, startMonth: e.target.value }))}>
                  {MONTHS.map((m, i) => <option key={i+1} value={i+1}>{m}</option>)}
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Año</Label>
                <Input type="number" value={form.startYear} onChange={e => setForm(p => p && ({ ...p, startYear: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label>Día inicial (0 = sem. 1)</Label>
                <Input type="number" min={0} max={30} value={form.startDay} onChange={e => setForm(p => p && ({ ...p, startDay: e.target.value }))} />
              </div>
            </div>

            <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest pt-1">Parámetros de crecimiento</p>
            <div className="grid grid-cols-2 gap-3">
              {([
                { key: 'initialHeight',   label: 'Altura inicial (cm)' },
                { key: 'baseGrowth',      label: 'Crecimiento base (cm/día)' },
                { key: 'optimalTemp',     label: 'Temp. óptima (°C)' },
                { key: 'optimalHumidity', label: 'Humedad óptima (%)' },
                { key: 'optimalLight',    label: 'Luz óptima (h)' },
              ] as const).map(({ key, label }) => (
                <div key={key} className="space-y-1.5">
                  <Label>{label}</Label>
                  <Input type="number" step="0.01" value={form[key]}
                    onChange={e => setForm(p => p && ({ ...p, [key]: e.target.value }))} />
                </div>
              ))}
              <div className="space-y-1.5">
                <Label>Predicción oficial (cm)</Label>
                <Input type="number" step="0.1" placeholder="Sin definir" value={form.officialPrediction}
                  onChange={e => setForm(p => p && ({ ...p, officialPrediction: e.target.value }))} />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Nota de predicción</Label>
              <Input value={form.predictionNote} onChange={e => setForm(p => p && ({ ...p, predictionNote: e.target.value }))} placeholder="Opcional" />
            </div>

            <div className="flex gap-2 pt-1">
              <Button variant="outline" onClick={() => { setEditSim(null); setForm(null) }} className="flex-1">Cancelar</Button>
              <Button onClick={saveEdit} disabled={saving || !form.name.trim()} className="flex-1">
                {saving ? 'Guardando…' : 'Guardar cambios'}
              </Button>
            </div>
          </div>
        )}
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
