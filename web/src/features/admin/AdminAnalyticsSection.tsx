'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip as ReTooltip,
  ResponsiveContainer, Cell, ReferenceLine, CartesianGrid, Legend,
} from 'recharts'
import { BarChart3, TrendingUp, TrendingDown, Minus, Users, FlaskConical, BookOpen, Leaf } from 'lucide-react'
import type { GroupStatResponse, GroupResponse, SimulationResponse } from '@simulador/shared'
import { Badge, Card, CardContent, Combobox } from '@/components/ui'
import { SectionHeader } from '@/components/shared'

interface Props {
  stats:       GroupStatResponse[]
  groups:      GroupResponse[]
  simulations: SimulationResponse[]
}

const COLORS = {
  emerald: '#10b981',
  blue:    '#3b82f6',
  amber:   '#f59e0b',
  red:     '#ef4444',
  zinc:    '#71717a',
}

function StatCard({ icon: Icon, color, value, label }: { icon: React.ElementType; color: string; value: number; label: string }) {
  return (
    <Card>
      <CardContent className="pt-4 pb-4 flex items-center gap-3">
        <div className={`w-9 h-9 rounded-xl bg-zinc-800/60 border border-zinc-700/50 flex items-center justify-center flex-shrink-0`}>
          <Icon className={`w-4 h-4 ${color}`} />
        </div>
        <div>
          <p className="text-2xl font-bold text-white leading-none">{value}</p>
          <p className="text-xs text-zinc-500 mt-0.5">{label}</p>
        </div>
      </CardContent>
    </Card>
  )
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 shadow-xl text-xs">
      <p className="text-zinc-300 font-medium mb-1">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: p.color ?? p.fill }} className="font-mono">
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  )
}

export function AdminAnalyticsSection({ stats, groups, simulations }: Props) {
  const router = useRouter()
  const [course, setCourse] = useState('')

  const courses = Array.from(new Set(groups.map(g => g.course))).sort()

  // Build a groupId → course map from groups
  const groupCourse: Record<string, string> = {}
  groups.forEach(g => { groupCourse[g.id] = g.course })

  const filteredStats = course ? stats.filter(s => groupCourse[s.id] === course || s.course === course) : stats
  const filteredSims  = course ? simulations.filter(s => {
    const g = groups.find(g => g.id === s.groupId)
    return g?.course === course
  }) : simulations

  const totalMembers  = groups.filter(g => !course || g.course === course).reduce((a, g) => a + (g._count?.members ?? 0), 0)
  const totalSessions = filteredSims.reduce((a, s) => a + (s._count?.entries ?? 0), 0)
  const filteredGroups = course ? groups.filter(g => g.course === course) : groups

  const withData = filteredStats.filter(s => s.totalEntries > 0)
  const ranked   = [...filteredStats].sort((a, b) => (b.bestHeight ?? 0) - (a.bestHeight ?? 0))

  const courseOptions = [
    { value: '', label: 'Todos los cursos' },
    ...courses.map(c => ({ value: c, label: c })),
  ]
  const CourseFilter = courses.length > 0 ? (
    <Combobox value={course} onChange={setCourse} options={courseOptions} size="sm" className="w-44" />
  ) : null

  // ── Chart data ──────────────────────────────────────────────────────────────
  const heightData = withData
    .sort((a, b) => (b.bestHeight ?? 0) - (a.bestHeight ?? 0))
    .map(s => ({ name: s.name, altura: s.bestHeight ?? 0, planta: s.plant }))

  const sessionData = stats
    .sort((a, b) => b.totalEntries - a.totalEntries)
    .map(s => ({ name: s.name, sesiones: s.totalEntries, sims: s.simCount }))

  const diffData = withData
    .filter(s => s.avgDiff != null)
    .sort((a, b) => (b.avgDiff ?? 0) - (a.avgDiff ?? 0))
    .map(s => ({ name: s.name, diferencia: s.avgDiff ?? 0 }))

  return (
    <section className="space-y-8 animate-in fade-in duration-300">

      {/* ── Stats cards ──────────────────────────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-[10px] font-semibold text-zinc-600 uppercase tracking-widest">Resumen general</p>
          {CourseFilter}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard icon={Users}        color="text-emerald-400" value={filteredGroups.length}  label="Grupos" />
          <StatCard icon={FlaskConical} color="text-blue-400"    value={filteredSims.length}     label="Simulaciones" />
          <StatCard icon={Users}        color="text-zinc-400"    value={totalMembers}             label="Integrantes" />
          <StatCard icon={BookOpen}     color="text-amber-400"   value={totalSessions}            label="Sesiones registradas" />
        </div>
      </div>

      {withData.length === 0 ? (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-12 text-center space-y-2">
          <BarChart3 className="w-10 h-10 text-zinc-700 mx-auto" />
          <p className="text-sm text-zinc-500">Sin mediciones todavía</p>
          <p className="text-xs text-zinc-700">Los datos aparecerán cuando los grupos comiencen a registrar sesiones.</p>
        </div>
      ) : (
        <>
          {/* ── Chart 1: Altura máxima ────────────────────────────────────── */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Leaf className="w-4 h-4 text-emerald-400" />
              <div>
                <p className="text-sm font-semibold text-zinc-200">Altura máxima alcanzada por grupo</p>
                <p className="text-xs text-zinc-600">Mejor medición real registrada en todas las sesiones de cada grupo.</p>
              </div>
            </div>
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4">
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={heightData} margin={{ top: 8, right: 8, left: -16, bottom: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                  <XAxis dataKey="name" tick={{ fill: '#71717a', fontSize: 11 }} angle={-30} textAnchor="end" interval={0} />
                  <YAxis tick={{ fill: '#71717a', fontSize: 11 }} unit=" cm" />
                  <ReTooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
                  <Bar dataKey="altura" name="Altura (cm)" radius={[4, 4, 0, 0]} maxBarSize={48}>
                    {heightData.map((_, i) => (
                      <Cell key={i} fill={i === 0 ? COLORS.emerald : '#3f3f46'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <p className="text-[10px] text-zinc-700 text-right mt-1">🏆 El grupo líder aparece en verde</p>
            </div>
          </div>

          {/* ── Chart 2: Sesiones registradas ────────────────────────────── */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-amber-400" />
              <div>
                <p className="text-sm font-semibold text-zinc-200">Actividad de campo — Sesiones registradas</p>
                <p className="text-xs text-zinc-600">Cantidad de mediciones realizadas por cada grupo. Indica constancia en el seguimiento.</p>
              </div>
            </div>
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4">
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={sessionData} margin={{ top: 8, right: 8, left: -16, bottom: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                  <XAxis dataKey="name" tick={{ fill: '#71717a', fontSize: 11 }} angle={-30} textAnchor="end" interval={0} />
                  <YAxis tick={{ fill: '#71717a', fontSize: 11 }} allowDecimals={false} />
                  <ReTooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
                  <Bar dataKey="sesiones" name="Sesiones" fill={COLORS.amber} radius={[4, 4, 0, 0]} maxBarSize={48} />
                  <Bar dataKey="sims"     name="Simulaciones" fill="#44403c" radius={[4, 4, 0, 0]} maxBarSize={48} />
                  <Legend wrapperStyle={{ fontSize: 11, color: '#71717a', paddingTop: 4 }} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* ── Chart 3: Real vs Modelo ───────────────────────────────────── */}
          {diffData.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-blue-400" />
                <div>
                  <p className="text-sm font-semibold text-zinc-200">Real vs Modelo matemático — diferencia promedio</p>
                  <p className="text-xs text-zinc-600">Promedio de (real − modelo) por sesión. Positivo = la planta creció más de lo esperado.</p>
                </div>
              </div>
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4">
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={diffData} margin={{ top: 8, right: 8, left: -16, bottom: 40 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                    <XAxis dataKey="name" tick={{ fill: '#71717a', fontSize: 11 }} angle={-30} textAnchor="end" interval={0} />
                    <YAxis tick={{ fill: '#71717a', fontSize: 11 }} unit=" cm" />
                    <ReTooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
                    <ReferenceLine y={0} stroke="#52525b" strokeDasharray="4 4" />
                    <Bar dataKey="diferencia" name="Dif. (cm)" radius={[4, 4, 0, 0]} maxBarSize={48}>
                      {diffData.map((d, i) => (
                        <Cell key={i} fill={d.diferencia >= 0 ? COLORS.emerald : COLORS.red} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                <p className="text-[10px] text-zinc-700 mt-1">Verde = sobre el modelo · Rojo = bajo el modelo</p>
              </div>
            </div>
          )}

          {/* ── Tabla de posiciones ───────────────────────────────────────── */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-zinc-400" />
              <div>
                <p className="text-sm font-semibold text-zinc-200">Tabla de posiciones — clasificación por altura</p>
                <p className="text-xs text-zinc-600">Grupos ordenados por la mayor altura real registrada. Clic en una fila para ir al grupo.</p>
              </div>
            </div>
            <div className="w-full overflow-x-auto rounded-xl border border-zinc-800">
              <table className="min-w-full text-xs text-left whitespace-nowrap">
                <thead className="text-zinc-400 bg-zinc-900/60 border-b border-zinc-800/60">
                  <tr>
                    <th className="px-3 py-3 font-medium w-8">#</th>
                    <th className="px-3 py-3 font-medium">Grupo</th>
                    <th className="px-3 py-3 font-medium">Curso · Planta</th>
                    <th className="px-3 py-3 font-medium text-center">Sesiones</th>
                    <th className="px-3 py-3 font-medium text-center">Mejor altura</th>
                    <th className="px-3 py-3 font-medium text-center">Dif. modelo</th>
                    <th className="px-3 py-3 font-medium text-center">Integrantes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60">
                  {ranked.map((s, i) => (
                    <tr
                      key={s.id}
                      className="hover:bg-zinc-800/40 transition-colors cursor-pointer"
                      onClick={() => router.push(`/grupo/${s.id}`)}
                    >
                      <td className="px-3 py-2.5 text-zinc-600 font-mono text-center">
                        {i === 0 && s.totalEntries > 0 ? '🏆' : i + 1}
                      </td>
                      <td className="px-3 py-2.5 font-medium text-white">{s.name}</td>
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
          </div>
        </>
      )}
    </section>
  )
}
