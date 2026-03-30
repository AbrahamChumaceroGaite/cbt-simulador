'use client'
import { useState, FormEvent, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Sprout } from 'lucide-react'
import { authService } from '@/services/auth.service'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [mode, setMode] = useState<'grupo' | 'admin'>('grupo')
  const [code, setCode] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function switchMode(m: 'grupo' | 'admin') {
    setMode(m); setCode(''); setPassword(''); setError('')
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(''); setLoading(true)
    try {
      const body: Parameters<typeof authService.login>[0] = { code: code.trim().toUpperCase(), mode }
      if (mode === 'admin') { body.code = code.trim().toLowerCase(); body.password = password }

      const session = await authService.login(body)

      if (session.role === 'admin') {
        router.push('/admin')
      } else {
        const from = searchParams.get('from')
        router.push(from && from.startsWith('/grupo/') ? from : `/grupo/${session.groupId}`)
      }
    } catch (e: any) {
      setError(e.message ?? 'Error al iniciar sesión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col md:flex-row relative overflow-hidden">
      {/* Blobs */}
      <div aria-hidden className="pointer-events-none fixed inset-0 overflow-hidden z-0">
        <div className="blob blob-1" />
        <div className="blob blob-2" />
        <div className="blob blob-3" />
      </div>

      {/* Left panel (desktop) */}
      <div className="hidden md:flex md:w-[45%] relative overflow-hidden flex-col justify-between p-12"
        style={{ background: 'linear-gradient(135deg, #18181b00 0%, #09090b80 60%, #0d1f1680 100%)' }}>
        <div className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-zinc-700/50 bg-zinc-900/50 text-zinc-400 text-xs font-medium mb-10">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            CBT · Sistema Activo
          </div>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-950 border border-emerald-900 flex items-center justify-center">
              <Sprout className="w-5 h-5 text-emerald-400" />
            </div>
            <h1 className="text-5xl font-black text-white leading-none tracking-tight">
              Plant<br />
              <span className="text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(135deg, #34d399, #10b981)' }}>
                Diary
              </span>
            </h1>
          </div>
          <p className="text-zinc-400 text-lg leading-relaxed">
            Simulador de Crecimiento<br />S.T.E.A.M #2 — Predicción y análisis.
          </p>
        </div>

        <div className="relative z-10 space-y-4">
          {[
            { icon: '🌱', label: 'Predicción de crecimiento', desc: 'Modela el crecimiento de tu planta' },
            { icon: '🌤️', label: 'Datos climáticos reales', desc: 'Temperatura y humedad de Tarija 2026' },
            { icon: '📊', label: 'Seguimiento diario', desc: 'Compara predicción vs. realidad' },
          ].map(f => (
            <div key={f.label} className="flex items-start gap-3 p-3 rounded-xl bg-zinc-900/40 border border-zinc-800/40">
              <span className="text-xl mt-0.5">{f.icon}</span>
              <div>
                <div className="text-zinc-200 text-sm font-medium">{f.label}</div>
                <div className="text-zinc-500 text-xs mt-0.5">{f.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel: form */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-12">
        {/* Mobile header */}
        <div className="md:hidden text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-950 border border-emerald-900 flex items-center justify-center">
              <Sprout className="w-4 h-4 text-emerald-400" />
            </div>
            <span className="text-2xl font-black text-white">Plant <span className="text-emerald-400">Diary</span></span>
          </div>
          <p className="text-zinc-500 text-sm">Simulador de Crecimiento S.T.E.A.M #2</p>
        </div>

        <div className="w-full max-w-[380px]">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-1">Bienvenido</h2>
            <p className="text-zinc-500 text-sm">Selecciona tu rol e ingresa tus datos</p>
          </div>

          {/* Mode toggle */}
          <div className="relative flex bg-zinc-900 border border-zinc-800 rounded-xl p-1 mb-8">
            <div className={`absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-lg bg-zinc-700 transition-all duration-300 ease-out ${mode === 'grupo' ? 'left-1' : 'left-[calc(50%+0px)]'}`} />
            <button type="button" onClick={() => switchMode('grupo')}
              className={`relative z-10 flex-1 py-2.5 rounded-lg text-sm font-semibold transition-colors duration-200 ${mode === 'grupo' ? 'text-zinc-100' : 'text-zinc-500 hover:text-zinc-400'}`}>
              Grupo
            </button>
            <button type="button" onClick={() => switchMode('admin')}
              className={`relative z-10 flex-1 py-2.5 rounded-lg text-sm font-semibold transition-colors duration-200 ${mode === 'admin' ? 'text-zinc-100' : 'text-zinc-500 hover:text-zinc-400'}`}>
              Administrador
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                {mode === 'grupo' ? 'Código de grupo' : 'Usuario'}
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 text-lg select-none">
                  {mode === 'grupo' ? '🌿' : '🔑'}
                </div>
                <input
                  type="text"
                  value={code}
                  onChange={e => setCode(mode === 'grupo' ? e.target.value.toUpperCase() : e.target.value)}
                  placeholder={mode === 'grupo' ? 'Ej: AB3X9K' : 'admin'}
                  maxLength={mode === 'grupo' ? 6 : undefined}
                  className={`w-full pl-11 h-12 text-sm rounded-lg border border-zinc-700 bg-zinc-900 text-white placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-emerald-500/40 focus:border-zinc-600 ${mode === 'grupo' ? 'tracking-widest font-mono text-center uppercase' : ''}`}
                  autoFocus required
                />
              </div>
              {mode === 'grupo' && (
                <p className="text-xs text-zinc-600 pl-1">Código de 6 caracteres que te dio tu docente</p>
              )}
            </div>

            {mode === 'admin' && (
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider">Contraseña</label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 text-lg select-none">🔒</div>
                  <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-11 h-12 text-sm rounded-lg border border-zinc-700 bg-zinc-900 text-white placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-emerald-500/40 focus:border-zinc-600"
                    required
                  />
                </div>
              </div>
            )}

            {error && (
              <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-red-950/40 border border-red-800/50">
                <span className="text-red-400 text-lg">⚠️</span>
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="relative w-full h-12 rounded-xl text-sm font-bold transition-all duration-200 overflow-hidden disabled:opacity-60"
              style={{
                background: loading ? '#27272a' : 'linear-gradient(135deg, #34d399, #10b981)',
                color: loading ? '#71717a' : '#052e16',
              }}
            >
              {!loading && (
                <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity"
                  style={{ background: 'linear-gradient(135deg, #6ee7b7, #34d399)' }} />
              )}
              <span className="relative z-10">
                {loading ? 'Verificando...' : mode === 'grupo' ? 'Entrar al grupo' : 'Ingresar al Panel'}
              </span>
            </button>
          </form>

          <p className="text-center text-zinc-700 text-xs mt-8">
            CBT S.T.E.A.M #2 · Plant Diary · Sistema privado
          </p>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="w-6 h-6 rounded-full border-2 border-zinc-700 border-t-emerald-400 animate-spin" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}
