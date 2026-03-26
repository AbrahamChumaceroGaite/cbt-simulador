'use client'
import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Settings, BookOpen, HelpCircle, Leaf, Lock, Target, LogOut } from 'lucide-react'
import { Badge } from '@/components/ui'
import { cn } from '@/lib/utils'
import type { Sim, ClimateDay, ClimateSummary, Tab } from '@/lib/types'
import { PlantaTab }     from './_components/PlantaTab'
import { ModeloTab }     from './_components/ModeloTab'
import { DiarioTab }     from './_components/DiarioTab'
import { PrediccionTab } from './_components/PrediccionTab'
import { AyudaTab }      from './_components/AyudaTab'

// ── Tab definitions ───────────────────────────────────────────────────────────
const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'planta',     label: 'Planta',     icon: <Leaf       className="w-4 h-4" /> },
  { id: 'modelo',     label: 'Modelo',     icon: <Settings   className="w-4 h-4" /> },
  { id: 'diario',     label: 'Diario',     icon: <BookOpen   className="w-4 h-4" /> },
  { id: 'prediccion', label: 'Predicción', icon: <Target     className="w-4 h-4" /> },
  { id: 'ayuda',      label: 'Ayuda',      icon: <HelpCircle className="w-4 h-4" /> },
]

// ── Page ──────────────────────────────────────────────────────────────────────
export default function SimulationPage({ params }: { params: { id: string; simId: string } }) {
  const router = useRouter()

  const [sim, setSim]                       = useState<Sim | null>(null)
  const [tab, setTab]                       = useState<Tab>('planta')
  const [saving, setSaving]                 = useState(false)
  const [toast, setToast]                   = useState('')
  const [climateDays, setClimateDays]       = useState<ClimateDay[] | null>(null)
  const [climateSummary, setClimateSummary] = useState<ClimateSummary | null>(null)

  // ── Load simulation ──────────────────────────────────────────────────────
  const loadSim = useCallback(() =>
    fetch(`/api/simulations/${params.simId}`)
      .then(r => r.json())
      .then(setSim),
  [params.simId])

  useEffect(() => { loadSim() }, [loadSim])

  // ── Fetch climate for saved start month/year ─────────────────────────────
  // Used by DiarioTab and PrediccionTab so they reflect real climate data.
  // ModeloTab manages its own climate state for the interactive date explorer.
  useEffect(() => {
    if (!sim) return
    fetch(`/api/climate?month=${sim.startMonth}&year=${sim.startYear}`)
      .then(r => r.json())
      .then(({ days, summary }) => {
        if (days) { setClimateDays(days); setClimateSummary(summary) }
      })
      .catch(() => {})
  }, [sim?.startMonth, sim?.startYear]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Helpers ──────────────────────────────────────────────────────────────
  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(''), 2500)
  }

  async function updateSim(patch: Partial<Sim>) {
    if (!sim) return
    setSaving(true)
    const updated = await fetch(`/api/simulations/${sim.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patch),
    }).then(r => r.json())
    setSim(updated)
    setSaving(false)
    showToast('Guardado ✓')
  }

  async function saveEntry(entry: Parameters<typeof DiarioTab>[0]['onSave'] extends (e: infer E) => unknown ? E : never) {
    if (!sim) return
    await fetch('/api/entries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ simulationId: sim.id, ...entry }),
    })
    await loadSim()
    showToast('Sesión guardada ✓')
  }

  // ── Loading state ─────────────────────────────────────────────────────────
  if (!sim) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-6 h-6 rounded-full border-2 border-zinc-700 border-t-white animate-spin" />
    </div>
  )

  // Ensure defaults for fields that may be absent in older DB rows
  const simSafe: Sim = {
    ...sim,
    startYear: sim.startYear ?? new Date().getFullYear(),
    startDay:  sim.startDay  ?? 0,
    projDays:  sim.projDays  ?? 45,
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-zinc-950 pb-28 relative overflow-hidden">
      {/* Background blobs */}
      <div aria-hidden className="pointer-events-none fixed inset-0 overflow-hidden z-0">
        <div className="blob blob-1" /><div className="blob blob-2" /><div className="blob blob-3" />
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full bg-zinc-800 border border-zinc-700 text-sm text-white shadow-xl">
          {toast}
        </div>
      )}

      {/* Header */}
      <header className="fixed top-3 left-3 right-3 z-20 rounded-2xl border border-zinc-800/70 bg-zinc-950/90 backdrop-blur-md shadow-xl shadow-black/40 px-4 py-3 flex items-center gap-3">
        <button
          onClick={() => router.push(`/grupo/${params.id}`)}
          className="text-zinc-500 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white truncate">{sim.name}</p>
          <p className="text-xs text-zinc-500">{sim.group.name} · {sim.plantName || sim.group.plant}</p>
        </div>
        <div className="flex items-center gap-2">
          {sim.isDemo   && <Badge variant="demo">Tutorial</Badge>}
          {sim.isLocked && <Badge variant="amber"><Lock className="w-2.5 h-2.5 mr-1" />Bloqueada</Badge>}
          {saving       && <span className="text-xs text-zinc-500 animate-pulse">Guardando...</span>}
          <button
            onClick={async () => { await fetch('/api/auth/logout', { method: 'POST' }); router.push('/login') }}
            title="Cerrar sesión"
            className="p-2 rounded-lg text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 transition-colors">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Bottom nav */}
      <nav className="floating-nav">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={cn('nav-item', tab === t.id && 'active')}>
            {t.icon}<span className="nav-label">{t.label}</span>
          </button>
        ))}
      </nav>

      {/* Content */}
      <main className="max-w-2xl mx-auto px-4 pt-20 pb-5 space-y-4">
        {tab === 'planta'     && <PlantaTab     sim={simSafe} onUpdate={updateSim} />}
        {tab === 'modelo'     && <ModeloTab     sim={simSafe} onUpdate={updateSim} />}
        {tab === 'diario'     && <DiarioTab     sim={simSafe} climateDays={climateDays} onSave={saveEntry} />}
        {tab === 'prediccion' && <PrediccionTab sim={simSafe} climateDays={climateDays}
            onUpdate={updateSim}
            onLock={() => updateSim({ isLocked: true }).then(() => showToast('Predicción bloqueada ✓'))} />}
        {tab === 'ayuda'      && <AyudaTab      sim={simSafe} />}
      </main>
    </div>
  )
}
