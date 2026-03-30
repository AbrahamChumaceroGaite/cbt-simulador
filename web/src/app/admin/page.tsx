'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Sprout, LogOut, Users, FlaskConical, Download } from 'lucide-react'
import type { GroupResponse, GroupStatResponse } from '@simulador/shared'
import { Card, CardContent, Tooltip } from '@/components/ui'
import { groupsService }    from '@/services/groups.service'
import { analyticsService } from '@/services/analytics.service'
import { backupService }    from '@/services/backup.service'
import { authService }      from '@/services/auth.service'
import { AdminGroupsSection }    from '@/features/admin/AdminGroupsSection'
import { AdminAnalyticsSection } from '@/features/admin/AdminAnalyticsSection'

type Group = GroupResponse
type GroupStat = GroupStatResponse

export default function AdminPage() {
  const router = useRouter()
  const [groups, setGroups] = useState<Group[]>([])
  const [stats, setStats]   = useState<GroupStat[]>([])
  const [loading, setLoading] = useState(true)
  const [backing, setBacking] = useState(false)

  async function load() {
    setLoading(true)
    const [groups, stats] = await Promise.all([
      groupsService.getAll(),
      analyticsService.getStats(),
    ])
    setGroups(groups)
    setStats(stats)
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
      a.href = url; a.download = `backup-plantas-${new Date().toISOString().split('T')[0]}.json`; a.click()
      URL.revokeObjectURL(url)
    } finally { setBacking(false) }
  }

  if (loading) return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
      <div className="w-6 h-6 rounded-full border-2 border-zinc-700 border-t-emerald-400 animate-spin" />
    </div>
  )

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
        <div className="grid grid-cols-2 gap-3">
          <Card>
            <CardContent className="pt-4 pb-4 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-950 border border-emerald-900 flex items-center justify-center">
                <Users className="w-4 h-4 text-emerald-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{groups.length}</p>
                <p className="text-xs text-zinc-500">Grupos activos</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-4 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center">
                <FlaskConical className="w-4 h-4 text-zinc-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{groups.reduce((a, g) => a + (g._count?.simulations ?? 0), 0)}</p>
                <p className="text-xs text-zinc-500">Simulaciones</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <AdminGroupsSection groups={groups} onReload={load} />
        <AdminAnalyticsSection stats={stats} />
      </main>

      <footer className="relative z-10 text-center py-6 text-zinc-700 text-xs">
        Ing. Abraham CG &mdash; 2026 · All rights reserved
      </footer>
    </div>
  )
}
