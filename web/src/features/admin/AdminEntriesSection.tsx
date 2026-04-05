'use client'
import { useEffect, useState } from 'react'
import { BookOpen, Plus, Pencil, Trash2 } from 'lucide-react'
import type { SimulationResponse, EntryResponse } from '@simulador/shared'
import { Button, EmptyState, Input, Label, Modal, Pagination, Tooltip, Combobox } from '@/components/ui'
import { SectionHeader } from '@/components/shared'
import { entriesService } from '@/services/entries.service'

interface Props {
  simulations: SimulationResponse[]
  showToast?:  (msg: string, ok?: boolean) => void
}

const BLANK = {
  sessionNum:   1,
  realHeight:   '',
  myPrediction: '',
  temperature:  '',
  humidity:     '',
  lightHours:   '',
  note:         '',
}

type FormState = typeof BLANK

export function AdminEntriesSection({ simulations, showToast }: Props) {
  const [selectedSimId, setSelectedSimId] = useState<string>(simulations[0]?.id ?? '')
  const [entries, setEntries]   = useState<EntryResponse[]>([])
  const [loading, setLoading]   = useState(false)
  const [page, setPage]         = useState(0)
  const [pageSize, setPageSize] = useState(5)

  const [showCreate, setShowCreate] = useState(false)
  const [editEntry, setEditEntry]   = useState<EntryResponse | null>(null)
  const [deleteId, setDeleteId]     = useState<string | null>(null)
  const [form, setForm]             = useState<FormState>(BLANK)
  const [saving, setSaving]         = useState(false)

  async function loadEntries(simId: string) {
    if (!simId) return
    setLoading(true)
    const data = await entriesService.getBySimulation(simId)
    setEntries(data)
    setPage(0)
    setLoading(false)
  }

  useEffect(() => { if (selectedSimId) loadEntries(selectedSimId) }, [selectedSimId])
  useEffect(() => { if (simulations.length > 0 && !selectedSimId) setSelectedSimId(simulations[0].id) }, [simulations])

  function openCreate() {
    const nextSession = entries.length > 0 ? Math.max(...entries.map(e => e.sessionNum)) + 1 : 1
    setForm({ ...BLANK, sessionNum: nextSession })
    setShowCreate(true)
  }

  function openEdit(e: EntryResponse) {
    setForm({
      sessionNum:   e.sessionNum,
      realHeight:   e.realHeight   != null ? String(e.realHeight)   : '',
      myPrediction: e.myPrediction != null ? String(e.myPrediction) : '',
      temperature:  e.temperature  != null ? String(e.temperature)  : '',
      humidity:     e.humidity     != null ? String(e.humidity)     : '',
      lightHours:   e.lightHours   != null ? String(e.lightHours)   : '',
      note:         e.note ?? '',
    })
    setEditEntry(e)
  }

  function parseNum(v: string): number | null {
    const n = parseFloat(v)
    return isNaN(n) ? null : n
  }

  async function saveEntry() {
    if (!selectedSimId) return
    setSaving(true)
    try {
      const dto = {
        simulationId: selectedSimId,
        sessionNum:   Number(form.sessionNum),
        realHeight:   parseNum(form.realHeight),
        myPrediction: parseNum(form.myPrediction),
        temperature:  parseNum(form.temperature),
        humidity:     parseNum(form.humidity),
        lightHours:   parseNum(form.lightHours),
        note:         form.note,
      }
      const { message } = await entriesService.save(dto)
      showToast?.(message)
      setShowCreate(false); setEditEntry(null)
      await loadEntries(selectedSimId)
    } catch (err: any) { showToast?.(err.message ?? 'Error', false) }
    finally { setSaving(false) }
  }

  async function confirmDelete() {
    if (!deleteId) return
    try {
      await entriesService.delete(deleteId)
      showToast?.('Sesión eliminada')
      setDeleteId(null)
      await loadEntries(selectedSimId)
    } catch (err: any) { showToast?.(err.message ?? 'Error', false) }
  }

  const paged      = entries.slice(page * pageSize, (page + 1) * pageSize)
  const selectedSim = simulations.find(s => s.id === selectedSimId)

  const simOptions = simulations.map(s => ({
    value: s.id,
    label: s.group ? `${s.group.name} — ${s.name}` : s.name,
  }))
  const SimFilter = (
    <Combobox value={selectedSimId} onChange={setSelectedSimId} options={simOptions} size="sm" className="w-56" />
  )

  return (
    <section className="space-y-3 animate-in fade-in duration-300">
      <SectionHeader
        icon={BookOpen}
        iconClass="text-zinc-400"
        title="Sesiones"
        subtitle={selectedSim
          ? `${selectedSim.plantName} · ${entries.length} medición${entries.length !== 1 ? 'es' : ''}`
          : `${entries.length} mediciones`}
        filters={SimFilter}
        actions={
          <Tooltip content="Nueva sesión">
            <Button size="sm" onClick={openCreate} disabled={!selectedSimId}>
              <Plus className="w-3.5 h-3.5" /> Nueva
            </Button>
          </Tooltip>
        }
      />

      {loading ? (
        <div className="space-y-2 py-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-14 w-full animate-pulse rounded-xl bg-zinc-800" />
          ))}
        </div>
      ) : entries.length === 0 ? (
        <EmptyState
          icon={<BookOpen className="w-10 h-10" />}
          title="Sin sesiones"
          description="Esta simulación no tiene mediciones registradas todavía."
          action={<Button size="sm" onClick={openCreate}><Plus className="w-3.5 h-3.5" /> Agregar sesión</Button>}
        />
      ) : (
        <>
          <div className="w-full overflow-x-auto rounded-xl border border-zinc-800">
            <table className="min-w-full text-xs text-left whitespace-nowrap">
              <thead className="text-zinc-400 bg-zinc-900/60 border-b border-zinc-800/60">
                <tr>
                  <th className="px-3 py-3 font-medium text-center">#</th>
                  <th className="px-3 py-3 font-medium">Fecha</th>
                  <th className="px-3 py-3 font-medium text-center">Predicción</th>
                  <th className="px-3 py-3 font-medium text-center">Altura real</th>
                  <th className="px-3 py-3 font-medium text-center">Temp °C</th>
                  <th className="px-3 py-3 font-medium text-center">Humedad %</th>
                  <th className="px-3 py-3 font-medium text-center">Luz h</th>
                  <th className="px-3 py-3 font-medium">Nota</th>
                  <th className="px-3 py-3 font-medium text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {paged.map(e => (
                  <tr key={e.id} className="hover:bg-zinc-800/40 transition-colors">
                    <td className="px-3 py-2.5 text-center text-zinc-500 font-mono">{e.sessionNum}</td>
                    <td className="px-3 py-2.5 text-zinc-400 font-mono">{e.date ? e.date.split('T')[0] : '—'}</td>
                    <td className="px-3 py-2.5 text-center font-mono">
                      {e.myPrediction != null
                        ? <span className="text-zinc-300">{e.myPrediction} cm</span>
                        : <span className="text-zinc-700">—</span>}
                    </td>
                    <td className="px-3 py-2.5 text-center font-mono">
                      {e.realHeight != null
                        ? <span className="text-emerald-400 font-bold">{e.realHeight} cm</span>
                        : <span className="text-zinc-700">—</span>}
                    </td>
                    <td className="px-3 py-2.5 text-center font-mono text-zinc-400">{e.temperature ?? '—'}</td>
                    <td className="px-3 py-2.5 text-center font-mono text-zinc-400">{e.humidity ?? '—'}</td>
                    <td className="px-3 py-2.5 text-center font-mono text-zinc-400">{e.lightHours ?? '—'}</td>
                    <td className="px-3 py-2.5 text-zinc-500 max-w-[160px] truncate">{e.note || '—'}</td>
                    <td className="px-3 py-2.5 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Tooltip content="Editar">
                          <button onClick={() => openEdit(e)} className="p-1 rounded text-zinc-600 hover:text-zinc-300 hover:bg-zinc-800 transition-colors">
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                        </Tooltip>
                        <Tooltip content="Eliminar">
                          <button onClick={() => setDeleteId(e.id)} className="p-1 rounded text-zinc-600 hover:text-red-400 hover:bg-red-950/30 transition-colors">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </Tooltip>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination
            page={page} totalItems={entries.length} pageSize={pageSize}
            onPageSizeChange={s => { setPageSize(s); setPage(0) }} onChange={setPage}
          />
        </>
      )}

      {/* Create / Edit modal */}
      <Modal open={showCreate || !!editEntry} onClose={() => { setShowCreate(false); setEditEntry(null) }}
        title={editEntry ? `Editar sesión #${editEntry.sessionNum}` : 'Nueva sesión'} lg>
        <EntryForm form={form} setForm={setForm} onCancel={() => { setShowCreate(false); setEditEntry(null) }} onSave={saveEntry} saving={saving} isEdit={!!editEntry} />
      </Modal>

      {/* Delete modal */}
      <Modal open={!!deleteId} onClose={() => setDeleteId(null)} title="Eliminar sesión">
        <div className="space-y-4">
          <p className="text-sm text-zinc-400">¿Eliminar esta sesión? Los datos de medición se perderán. Esta acción no se puede deshacer.</p>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setDeleteId(null)} className="flex-1">Cancelar</Button>
            <Button variant="destructive" onClick={confirmDelete} className="flex-1">Eliminar</Button>
          </div>
        </div>
      </Modal>
    </section>
  )
}

function EntryForm({ form, setForm, onCancel, onSave, saving, isEdit }: {
  form:    FormState
  setForm: (f: FormState) => void
  onCancel: () => void
  onSave:   () => void
  saving:   boolean
  isEdit:   boolean
}) {
  function set(key: keyof FormState, value: string | number) {
    setForm({ ...form, [key]: value })
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>Sesión #</Label>
          <Input type="number" min={1} value={form.sessionNum} onChange={e => set('sessionNum', e.target.value)} disabled={isEdit} />
        </div>
        <div className="space-y-1.5">
          <Label>Altura real (cm)</Label>
          <Input type="number" step="0.1" placeholder="ej. 12.5" value={form.realHeight} onChange={e => set('realHeight', e.target.value)} autoFocus />
        </div>
        <div className="space-y-1.5">
          <Label>Mi predicción (cm)</Label>
          <Input type="number" step="0.1" placeholder="ej. 11.0" value={form.myPrediction} onChange={e => set('myPrediction', e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label>Temperatura (°C)</Label>
          <Input type="number" step="0.1" placeholder="ej. 18.5" value={form.temperature} onChange={e => set('temperature', e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label>Humedad (%)</Label>
          <Input type="number" step="0.1" placeholder="ej. 65" value={form.humidity} onChange={e => set('humidity', e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label>Horas de luz</Label>
          <Input type="number" step="0.5" placeholder="ej. 12" value={form.lightHours} onChange={e => set('lightHours', e.target.value)} />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label>Nota <span className="text-zinc-600">(opcional)</span></Label>
        <Input value={form.note} onChange={e => set('note', e.target.value)} placeholder="Observaciones de la sesión..." />
      </div>
      <div className="flex gap-2 pt-1">
        <Button variant="outline" onClick={onCancel} className="flex-1">Cancelar</Button>
        <Button onClick={onSave} disabled={saving} loading={saving} className="flex-1">
          {isEdit ? 'Actualizar' : 'Crear sesión'}
        </Button>
      </div>
    </div>
  )
}
