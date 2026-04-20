'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Sprout, LogOut, Users, FlaskConical, BookOpen, BarChart3, Shield, Activity } from 'lucide-react'
import type { GroupResponse, GroupStatResponse, SimulationResponse } from '@simulador/shared'
import { Toast, Tooltip } from '@/components/ui'
import { FloatingNav, LogoutModal } from '@/components/shared'
import type { NavTab }             from '@/components/shared'
import { groupsService }           from '@/services/groups.service'
import { analyticsService }        from '@/services/analytics.service'
import { authService }             from '@/services/auth.service'
import { simulationsService }      from '@/services/simulations.service'
import { AdminGroupsSection }      from '@/features/admin/AdminGroupsSection'
import { AdminAnalyticsSection }   from '@/features/admin/AdminAnalyticsSection'
import { AdminSimulationsSection } from '@/features/admin/AdminSimulationsSection'
import { AdminEntriesSection }     from '@/features/admin/AdminEntriesSection'
import { AdminSection }            from '@/features/admin/AdminSection'
import { AdminMonitoreoSection }  from '@/features/admin/AdminMonitoreoSection'

type Tab = 'grupos' | 'simulaciones' | 'sesiones' | 'analytics' | 'monitoreo' | 'admin'

const TABS: NavTab<Tab>[] = [
  { id: 'grupos',       label: 'Grupos',       icon: Users        },
  { id: 'simulaciones', label: 'Simulaciones', icon: FlaskConical },
  { id: 'sesiones',     label: 'Sesiones',     icon: BookOpen     },
  { id: 'analytics',   label: 'Analytics',    icon: BarChart3    },
  { id: 'monitoreo',   label: 'Monitoreo',    icon: Activity     },
  { id: 'admin',       label: 'Admin',        icon: Shield       },
]

export default function AdminPage() {
  const router = useRouter()
  const [tab, setTab]                   = useState<Tab>('grupos')
  const [groups, setGroups]             = useState<GroupResponse[]>([])
  const [stats, setStats]               = useState<GroupStatResponse[]>([])
  const [simulations, setSimulations]   = useState<SimulationResponse[]>([])
  const [loading, setLoading]           = useState(true)
  const [toast, setToast]               = useState<{ msg: string; ok: boolean } | null>(null)
  const [logoutModalOpen, setLogoutModalOpen] = useState(false)

  function showToast(msg: string, ok = true) {
    setToast({ msg, ok })
    setTimeout(() => setToast(null), 3000)
  }

  async function load() {
    setLoading(true)
    const [g, s, sims] = await Promise.all([
      groupsService.getAll(),
      analyticsService.getStats(),
      simulationsService.getAll(),
    ])
    setGroups(g)
    setStats(s)
    setSimulations(sims)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function logout() {
    setLogoutModalOpen(false)
    await authService.logout()
    router.push('/login')
  }

  if (loading) return (
    <div className="min-h-screen bg-zinc-950 p-6 space-y-4">
      <div className="h-12 w-48 animate-pulse rounded-xl bg-zinc-800" />
      <div className="h-10 w-full animate-pulse rounded-xl bg-zinc-800" />
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-14 w-full animate-pulse rounded-xl bg-zinc-800" />
        ))}
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-zinc-950 relative overflow-hidden">
      <div aria-hidden className="pointer-events-none fixed inset-0 overflow-hidden z-0">
        <div className="blob blob-1" /><div className="blob blob-2" /><div className="blob blob-3" />
      </div>

      {toast && <Toast msg={toast.msg} ok={toast.ok} />}

      <header className="fixed top-3 left-3 right-3 z-20 rounded-2xl border border-zinc-800/70 bg-zinc-950/90 backdrop-blur-md shadow-xl shadow-black/40 px-4 py-3 flex items-center gap-3">
        <div className="w-7 h-7 rounded-lg bg-emerald-950 border border-emerald-900 flex items-center justify-center flex-shrink-0">
          <Sprout className="w-3.5 h-3.5 text-emerald-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white">Panel Administrativo</p>
          <p className="text-xs text-zinc-500">Plant Diary · S.T.E.A.M #2</p>
        </div>
        <Tooltip content="Cerrar sesión" side="bottom">
          <button onClick={() => setLogoutModalOpen(true)} className="p-2 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-zinc-800 transition-colors">
            <LogOut className="w-4 h-4" />
          </button>
        </Tooltip>
      </header>

      <main className="max-w-3xl mx-auto px-4 pt-20 page-wrapper space-y-6">
        {tab === 'grupos'       && <AdminGroupsSection      groups={groups}                        onReload={load} showToast={showToast} />}
        {tab === 'simulaciones' && <AdminSimulationsSection  simulations={simulations} groups={groups} onReload={load} showToast={showToast} />}
        {tab === 'sesiones'     && simulations.length > 0 && <AdminEntriesSection simulations={simulations} showToast={showToast} />}
        {tab === 'sesiones'     && simulations.length === 0 && (
          <p className="text-sm text-zinc-600 text-center py-8">No hay simulaciones todavía.</p>
        )}
        {tab === 'analytics'   && <AdminAnalyticsSection stats={stats} groups={groups} simulations={simulations} />}
        {tab === 'monitoreo'   && <AdminMonitoreoSection />}
        {tab === 'admin'       && <AdminSection showToast={showToast} reloadAll={load} />}
      </main>

      <FloatingNav tabs={TABS} active={tab} onTabChange={setTab} />
      <LogoutModal open={logoutModalOpen} onConfirm={logout} onCancel={() => setLogoutModalOpen(false)} />

      <footer className="relative z-10 text-center py-6 text-zinc-700 text-xs">
        Ing. Abraham CG &mdash; 2026 · All rights reserved
      </footer>
    </div>
  )
}
