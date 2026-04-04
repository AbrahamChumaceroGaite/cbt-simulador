'use client'
import { useEffect, useState } from 'react'
import { BookOpen } from 'lucide-react'
import type { SimulationResponse, EntryResponse } from '@simulador/shared'
import { EmptyState, Select, Pagination } from '@/components/ui'
import { SectionHeader } from '@/components/shared'
import { entriesService } from '@/services/entries.service'

interface AdminEntriesSectionProps {
  simulations: SimulationResponse[]
}

export function AdminEntriesSection({ simulations }: AdminEntriesSectionProps) {
  const [selectedSimId, setSelectedSimId] = useState<string>(simulations[0]?.id ?? '')
  const [entries, setEntries]   = useState<EntryResponse[]>([])
  const [loading, setLoading]   = useState(false)
  const [page, setPage]         = useState(0)
  const [pageSize, setPageSize] = useState(10)

  async function loadEntries(simId: string) {
    if (!simId) return
    setLoading(true)
    const data = await entriesService.getBySimulation(simId)
    setEntries(data)
    setPage(0)
    setLoading(false)
  }

  useEffect(() => {
    if (selectedSimId) loadEntries(selectedSimId)
  }, [selectedSimId])

  useEffect(() => {
    if (simulations.length > 0 && !selectedSimId) setSelectedSimId(simulations[0].id)
  }, [simulations])

  const paged = entries.slice(page * pageSize, (page + 1) * pageSize)

  const selectedSim = simulations.find(s => s.id === selectedSimId)

  const SimFilter = (
    <Select value={selectedSimId} onChange={e => setSelectedSimId(e.target.value)} className="text-xs h-8 max-w-xs">
      {simulations.map(s => (
        <option key={s.id} value={s.id}>{s.group ? `${s.group.name} — ` : ''}{s.name}</option>
      ))}
    </Select>
  )

  return (
    <section className="space-y-3 animate-in fade-in duration-300">
      <SectionHeader
        icon={BookOpen}
        iconClass="text-zinc-400"
        title="Sesiones"
        subtitle={selectedSim ? `${selectedSim.plantName} · ${entries.length} medición${entries.length !== 1 ? 'es' : ''}` : `${entries.length} mediciones`}
        filters={SimFilter}
      />

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="w-5 h-5 rounded-full border-2 border-zinc-700 border-t-emerald-400 animate-spin" />
        </div>
      ) : entries.length === 0 ? (
        <EmptyState
          icon={<BookOpen className="w-10 h-10" />}
          title="Sin sesiones"
          description="Esta simulación no tiene mediciones registradas todavía."
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
                    <td className="px-3 py-2.5 text-center font-mono text-zinc-400">
                      {e.temperature ?? '—'}
                    </td>
                    <td className="px-3 py-2.5 text-center font-mono text-zinc-400">
                      {e.humidity ?? '—'}
                    </td>
                    <td className="px-3 py-2.5 text-center font-mono text-zinc-400">
                      {e.lightHours ?? '—'}
                    </td>
                    <td className="px-3 py-2.5 text-zinc-500 max-w-[200px] truncate">
                      {e.note || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination
            page={page}
            totalItems={entries.length}
            pageSize={pageSize}
            onPageSizeChange={s => { setPageSize(s); setPage(0) }}
            onChange={setPage}
          />
        </>
      )}
    </section>
  )
}
