'use client'
import { useRouter } from 'next/navigation'
import { BarChart3, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { Badge } from '@/components/ui'

type GroupStat = {
  id: string; name: string; course: string; plant: string; code: string
  memberCount: number; simCount: number; totalEntries: number
  bestHeight: number | null; bestSimName: string; avgDiff: number | null
}

interface AdminAnalyticsSectionProps {
  stats: GroupStat[]
}

export function AdminAnalyticsSection({ stats }: AdminAnalyticsSectionProps) {
  const router = useRouter()
  const visible = stats.filter(s => s.totalEntries > 0)
  if (visible.length === 0) return null

  return (
    <section className="space-y-3">
      <div className="flex items-center gap-2">
        <p className="text-xs font-medium text-zinc-500 uppercase tracking-wide">Analytics de clase</p>
        <BarChart3 className="w-3.5 h-3.5 text-zinc-600" />
      </div>

      <div className="w-full overflow-x-auto rounded-xl border border-zinc-800">
        <table className="min-w-full text-xs text-left whitespace-nowrap">
          <thead className="text-zinc-400 bg-zinc-900/60 border-b border-zinc-800/60">
            <tr>
              <th className="px-3 py-3 font-medium">Grupo</th>
              <th className="px-3 py-3 font-medium">Curso · Planta</th>
              <th className="px-3 py-3 font-medium text-center">Sesiones</th>
              <th className="px-3 py-3 font-medium text-center">Mejor altura</th>
              <th className="px-3 py-3 font-medium text-center">Dif. modelo</th>
              <th className="px-3 py-3 font-medium text-center">Integrantes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/60">
            {[...stats].sort((a, b) => (b.bestHeight ?? 0) - (a.bestHeight ?? 0)).map((s, i) => (
              <tr key={s.id} className="hover:bg-zinc-800/40 transition-colors cursor-pointer"
                onClick={() => router.push(`/grupo/${s.id}`)}>
                <td className="px-3 py-2.5">
                  <div className="flex items-center gap-2">
                    {i === 0 && s.totalEntries > 0 && <span className="text-amber-400 text-[10px]">🏆</span>}
                    <span className="font-medium text-white">{s.name}</span>
                  </div>
                </td>
                <td className="px-3 py-2.5">
                  <div className="flex items-center gap-1.5">
                    <Badge variant="default">{s.course}</Badge>
                    <Badge variant="green">{s.plant}</Badge>
                  </div>
                </td>
                <td className="px-3 py-2.5 text-center">
                  <span className={s.totalEntries > 0 ? 'text-zinc-300 font-medium' : 'text-zinc-600'}>{s.totalEntries}</span>
                </td>
                <td className="px-3 py-2.5 text-center font-mono">
                  {s.bestHeight != null
                    ? <span className="text-emerald-400 font-bold">{s.bestHeight} cm</span>
                    : <span className="text-zinc-600">—</span>}
                </td>
                <td className="px-3 py-2.5 text-center font-mono">
                  {s.avgDiff != null ? (
                    <span className={`flex items-center justify-center gap-1 font-medium ${s.avgDiff > 0 ? 'text-emerald-400' : s.avgDiff < 0 ? 'text-red-400' : 'text-zinc-500'}`}>
                      {s.avgDiff > 0 ? <TrendingUp className="w-3 h-3" /> : s.avgDiff < 0 ? <TrendingDown className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
                      {s.avgDiff > 0 ? '+' : ''}{s.avgDiff}
                    </span>
                  ) : <span className="text-zinc-600">—</span>}
                </td>
                <td className="px-3 py-2.5 text-center text-zinc-400">{s.memberCount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-[10px] text-zinc-700 pl-1">
        Dif. modelo = promedio (real − modelo matemático) por sesión · Positivo = la planta creció más que el modelo.
      </p>
    </section>
  )
}
