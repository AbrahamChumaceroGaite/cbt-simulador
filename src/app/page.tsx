'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Sprout, ArrowRight, Plus, BookOpen } from 'lucide-react'
import { Button, Card, CardContent, CardHeader, CardTitle, CardDescription, Input, Label, Select, Badge, Modal } from '@/components/ui'

const COURSES = ['S2A', 'S2B', 'S2C']
const PLANTS  = ['Lechuga', 'Tomate', 'Tomate Cherry']

export default function HomePage() {
  const router = useRouter()
  const [code, setCode]     = useState('')
  const [error, setError]   = useState('')
  const [loading, setLoading] = useState(false)
  const [showCreate, setShowCreate] = useState(false)
  const [form, setForm] = useState({ name: '', course: COURSES[0], plant: PLANTS[0] })
  const [creating, setCreating] = useState(false)

  async function joinGroup() {
    if (!code.trim()) return
    setLoading(true); setError('')
    try {
      const r = await fetch(`/api/groups/${code.trim().toUpperCase()}`, { method: 'POST' })
      if (!r.ok) { setError('Código no encontrado. Verifica e intenta de nuevo.'); setLoading(false); return }
      const g = await r.json()
      router.push(`/grupo/${g.id}`)
    } catch { setError('Error de conexión.'); setLoading(false) }
  }

  async function createGroup() {
    if (!form.name.trim()) return
    setCreating(true)
    const r = await fetch('/api/groups', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const g = await r.json()
    setCreating(false)
    router.push(`/grupo/${g.id}`)
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 gap-8">

      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2 mb-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-950 border border-emerald-900 flex items-center justify-center">
            <Sprout className="w-5 h-5 text-emerald-400" />
          </div>
          <span className="text-lg font-semibold text-white">PlantSim</span>
          <Badge variant="blue">GP Stage 8</Badge>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white">Simulador de Crecimiento</h1>
        <p className="text-zinc-500 text-sm max-w-xs mx-auto">
          Predice, mide y analiza el crecimiento de tu planta con datos reales.
        </p>
      </div>

      {/* Cards */}
      <div className="w-full max-w-sm space-y-3">

        {/* Join */}
        <Card>
          <CardHeader>
            <CardTitle>Unirse a un grupo</CardTitle>
            <CardDescription>Ingresa el código que te dio tu docente o tu compañero.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1.5">
              <Label>Código de grupo</Label>
              <Input
                placeholder="Ej: AB3X9K"
                value={code}
                onChange={e => setCode(e.target.value.toUpperCase())}
                onKeyDown={e => e.key === 'Enter' && joinGroup()}
                maxLength={6}
                className="text-center text-xl tracking-widest font-mono uppercase"
              />
            </div>
            {error && <p className="text-xs text-red-400">{error}</p>}
            <Button onClick={joinGroup} disabled={loading || !code.trim()} className="w-full">
              {loading ? 'Buscando...' : 'Entrar al grupo'} <ArrowRight className="w-4 h-4" />
            </Button>
          </CardContent>
        </Card>

        {/* Create */}
        <Card className="border-dashed">
          <CardContent className="pt-5">
            <button
              onClick={() => setShowCreate(true)}
              className="w-full flex items-center gap-3 text-left group"
            >
              <div className="w-9 h-9 rounded-lg border border-zinc-700 flex items-center justify-center group-hover:border-zinc-500 transition-colors">
                <Plus className="w-4 h-4 text-zinc-500 group-hover:text-zinc-300" />
              </div>
              <div>
                <p className="text-sm font-medium text-zinc-300 group-hover:text-white transition-colors">Crear nuevo grupo</p>
                <p className="text-xs text-zinc-600">Si tu grupo aún no existe</p>
              </div>
            </button>
          </CardContent>
        </Card>

        {/* Demo */}
        <button
          onClick={async () => {
            const r = await fetch('/api/groups/DEMO', { method: 'POST' })
            if (r.ok) { const g = await r.json(); router.push(`/grupo/${g.id}`) }
          }}
          className="w-full flex items-center justify-center gap-2 text-zinc-600 hover:text-zinc-400 transition-colors text-sm py-2"
        >
          <BookOpen className="w-4 h-4" />
          Ver simulación tutorial
        </button>
      </div>

      {/* Create modal */}
      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Crear nuevo grupo">
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>Nombre del grupo</Label>
            <Input
              placeholder="Ej: Los Botanistas"
              value={form.name}
              onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Curso</Label>
              <Select value={form.course} onChange={e => setForm(p => ({ ...p, course: e.target.value }))}>
                {COURSES.map(c => <option key={c}>{c}</option>)}
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Planta</Label>
              <Select value={form.plant} onChange={e => setForm(p => ({ ...p, plant: e.target.value }))}>
                {PLANTS.map(pl => <option key={pl}>{pl}</option>)}
              </Select>
            </div>
          </div>
          <div className="pt-2 flex gap-2">
            <Button variant="outline" onClick={() => setShowCreate(false)} className="flex-1">Cancelar</Button>
            <Button onClick={createGroup} disabled={creating || !form.name.trim()} className="flex-1">
              {creating ? 'Creando...' : 'Crear grupo'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
