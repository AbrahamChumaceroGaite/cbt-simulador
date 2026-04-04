'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { FlaskConical, Trash2, Lock, LockOpen, ChevronRight, Pencil } from 'lucide-react'
import type { SimulationResponse } from '@simulador/shared'
import { Button, Card, CardContent, Modal, Badge, EmptyState, Tooltip, Pagination } from '@/components/ui'
import { simulationsService } from '@/services/simulations.service'

interface AdminSimulationsSectionProps {
  simulations: SimulationResponse[]
  onReload: () => void
}

export function AdminSimulationsSection({ simulations, onReload }: AdminSimulationsSectionProps) {
  const router = useRouter()
  const [page, setPage]         = useState(0)
  const [pageSize, setPageSize] = useState(10)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [toggling, setToggling] = useState<string | null>(null)

  async function confirmDelete() {
    if (!deleteId) return
    await simulationsService.delete(deleteId)
    setDeleteId(null)
    onReload()
  }

  async function toggleLock(sim: SimulationResponse) {
    setToggling(sim.id)
    await simulationsService.update(sim.id, { isLocked: !sim.isLocked })
    setToggling(null)
    onReload()
  }

  const paged = simulations.slice(page * pageSize, (page + 1) * pageSize)

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-zinc-500 uppercase tracking-wide">
          Simulaciones · {simulations.length}
        </p>
      </div>

      {simulations.length === 0 ? (
        <EmptyState
          icon={<FlaskConical className="w-10 h-10" />}
          title="Sin simulaciones"
          description="Los grupos aún no han creado ninguna simulación."
        />
      ) : (
        <>
          <div className="space-y-2">
            {paged.map(sim => (
              <Card key={sim.id} className="group">
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
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-xs text-zinc-600 flex-wrap">
                        {sim.group && <span className="text-zinc-500">{sim.group.name}</span>}
                        <span>{sim._count?.entries ?? 0} sesión{(sim._count?.entries ?? 0) !== 1 ? 'es' : ''}</span>
                        <span>{sim.plantName}</span>
                        <span className="font-mono">{sim.startYear}/{String(sim.startMonth).padStart(2,'0')}/{String(sim.startDay).padStart(2,'0')}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Tooltip content="Ver simulación">
                        <button
                          onClick={() => sim.group && router.push(`/grupo/${sim.groupId}/simulacion/${sim.id}`)}
                          className="p-1.5 rounded-lg text-zinc-600 hover:text-zinc-300 hover:bg-zinc-800 transition-colors"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </Tooltip>
                      <Tooltip content={sim.isLocked ? 'Desbloquear' : 'Bloquear'}>
                        <button
                          onClick={() => toggleLock(sim)}
                          disabled={toggling === sim.id}
                          className="p-1.5 rounded-lg text-zinc-600 hover:text-zinc-300 hover:bg-zinc-800 transition-colors disabled:opacity-40"
                        >
                          {sim.isLocked
                            ? <LockOpen className="w-3.5 h-3.5" />
                            : <Lock    className="w-3.5 h-3.5" />}
                        </button>
                      </Tooltip>
                      <Tooltip content="Eliminar simulación">
                        <button
                          onClick={() => setDeleteId(sim.id)}
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
            totalItems={simulations.length}
            pageSize={pageSize}
            onPageSizeChange={s => { setPageSize(s); setPage(0) }}
            onChange={setPage}
          />
        </>
      )}

      <Modal open={!!deleteId} onClose={() => setDeleteId(null)} title="Eliminar simulación">
        <div className="space-y-4">
          <p className="text-sm text-zinc-400">
            ¿Eliminar esta simulación? Se perderán todas sus sesiones y mediciones. Esta acción no se puede deshacer.
          </p>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setDeleteId(null)} className="flex-1">Cancelar</Button>
            <Button variant="destructive" onClick={confirmDelete} className="flex-1">Eliminar</Button>
          </div>
        </div>
      </Modal>
    </section>
  )
}
