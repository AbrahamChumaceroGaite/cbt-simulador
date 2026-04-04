'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Sprout, LogOut, Users, FlaskConical, Download, BookOpen, BarChart3 } from 'lucide-react'
import type { GroupResponse, GroupStatResponse, SimulationResponse } from '@simulador/shared'
import { Card, CardContent, Tooltip } from '@/components/ui'
import { groupsService }       from '@/services/groups.service'
import { analyticsService }    from '@/services/analytics.service'
import { backupService }       from '@/services/backup.service'
import { authService }         from '@/services/auth.service'
import { simulationsService }  from '@/services/simulations.service'
import { AdminGroupsSection }       from '@/features/admin/AdminGroupsSection'
import { AdminAnalyticsSection }    from '@/features/admin/AdminAnalyticsSection'
import { AdminSimulationsSection }  from '@/features/admin/AdminSimulationsSection'
import { AdminMembersSection }      from '@/features/admin/AdminMembersSection'
import { AdminEntriesSection }      from '@/features/admin/AdminEntriesSection'

type Tab = 'grupos' | 'simulaciones' | 'integrantes' | 'sesiones' | 'analytics'

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'grupos',        label: 'Grupos',        icon: <Users       className="w-3.5 h-3.5" /> },
  { id: 'simulaciones',  label: 'Simulaciones',  icon: <FlaskConical className="w-3.5 h-3.5" /> },
  { id: 'integrantes',   label: 'Integrantes',   icon: <Users       className="w-3.5 h-3.5" /> },
  { id: 'sesiones',      label: 'Sesiones',      icon: <BookOpen    className="w-3.5 h-3.5" /> },
  { id: 'analytics',     label: 'Analytics',     icon: <BarChart3   className="w-3.5 h-3.5" /> },
]

export default function AdminPage() {
  const router = useRouter()
  const [tab, setTab]           = useState<Tab>('grupos')
  const [groups, setGroups]     = useState<GroupResponse[]>([])
  const [stats, setStats]       = useState<GroupStatResponse[]>([])
  const [simulations, setSimulations] = useState<SimulationResponse[]>([])
  const [loading, setLoading]   = useState(true)
  const [backing, setBacking]   = useState(false)

  async function load() {
    setLoading(true)
    const [groups, stats, simulations] = await Promise.all([
      groupsService.getAll(),
      analyticsService.getStats(),
      simulationsService.getAll(),
    ])
    setGroups(groups)
    setStats(stats)
    setSimulations(simulations)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function logout() {
    await authService.logout()
    router.push('/login')
  }

  async function downloadBackup() {
    setBacking(true)
    try {
      const res  = await backupService.download()
      if (!res.ok) return
      const blob = await res.blob()
      const url  = URL.createObjectURL(blob)
      const a    = document.createElement('a')
      a.href = url
      a.download = `backup-plantas-${new Date().toISOString().split('T')[0]}.json`
      a.click()
      URL.revokeObjectURL(url)
    } finally { setBacking(false) }
  }

  if (loading) return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
      <div className="w-6 h-6 rounded-full border-2 border-zinc-700 border-t-emerald-400 animate-spin" />
    </div>
  )

  const totalMembers = groups.reduce((a, g) => a + (g._count?.members ?? 0), 0)

  return (
    <div className="min-h-screen bg-zinc-950 relative overflow-hidden">
      <div aria-hidden className="pointer-events-none fixed inset-0 overflow-hidden z-0">
        <div className="blob blob-1" /><div className="blob blob-2" /><div className="blob blob-3" />
      </div>

      <header className="fixed top-3 left-3 right-3 z-20 rounded-2xl border border-zinc-800/70 bg-zinc-950/90 backdrop-blur-md shadow-xl shadow-black/40 px-4 py-3 flex items-center gap-3">
        <div className="w-7 h-7 rounded-lg bg-emerald-950 border border-emerald-900 flex items-center justify-center flex-shrink-0">
          <Sprout className="w-3.5 h-3.5 text-emerald-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white">Panel Administrativo</p>
          <p className="text-xs text-zinc-500">Plant Diary · S.T.E.A.M #2</p>
        </div>
        <Tooltip content="Descargar backup JSON" side="bottom">
          <button onClick={downloadBackup} disabled={backing} className="p-2 rounded-lg text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 transition-colors disabled:opacity-40">
            <Download className="w-4 h-4" />
          </button>
        </Tooltip>
        <Tooltip content="Cerrar sesión" side="bottom">
          <button onClick={logout} className="p-2 rounded-lg text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 transition-colors">
            <LogOut className="w-4 h-4" />
          </button>
        </Tooltip>
      </header>

      <main className="max-w-3xl mx-auto px-4 pt-20 pb-8 space-y-6">
        {/* Summary stats */}
        <div className="grid grid-cols-4 gap-3">
          <Card>
            <CardContent className="pt-3 pb-3 flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <div>
                <p className="text-xl font-bold text-white">{groups.length}</p>
                <p className="text-[10px] text-zinc-500">Grupos</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-3 pb-3 flex items-center gap-2">
              <FlaskConical className="w-4 h-4 text-zinc-400 flex-shrink-0" />
              <div>
                <p className="text-xl font-bold text-white">{simulations.length}</p>
                <p className="text-[10px] text-zinc-500">Simulaciones</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-3 pb-3 flex items-center gap-2">
              <Users className="w-4 h-4 text-zinc-400 flex-shrink-0" />
              <div>
                <p className="text-xl font-bold text-white">{totalMembers}</p>
                <p className="text-[10px] text-zinc-500">Integrantes</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-3 pb-3 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-zinc-400 flex-shrink-0" />
              <div>
                <p className="text-xl font-bold text-white">
                  {simulations.reduce((a, s) => a + (s._count?.entries ?? 0), 0)}
                </p>
                <p className="text-[10px] text-zinc-500">Sesiones</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tab nav */}
        <div className="flex items-center gap-1 bg-zinc-900/60 border border-zinc-800/60 rounded-xl p-1 overflow-x-auto">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                tab === t.id
                  ? 'bg-zinc-800 text-white shadow'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {tab === 'grupos'       && <AdminGroupsSection      groups={groups}           onReload={load} />}
        {tab === 'simulaciones' && <AdminSimulationsSection  simulations={simulations} onReload={load} />}
        {tab === 'integrantes'  && <AdminMembersSection      groups={groups} />}
        {tab === 'sesiones'     && simulations.length > 0 && <AdminEntriesSection simulations={simulations} />}
        {tab === 'sesiones'     && simulations.length === 0 && (
          <p className="text-sm text-zinc-600 text-center py-8">No hay simulaciones todavía.</p>
        )}
        {tab === 'analytics'    && <AdminAnalyticsSection    stats={stats} />}
      </main>

      <footer className="relative z-10 text-center py-6 text-zinc-700 text-xs">
        Ing. Abraham CG &mdash; 2026 · All rights reserved
      </footer>
    </div>
  )
}
