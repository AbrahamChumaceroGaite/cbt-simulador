'use client'
import { Save, AlertCircle } from 'lucide-react'
import { Button, Input, Label, Separator, Modal } from '@/components/ui'
import type { Entry } from '@/lib/types'

type FormSession = Partial<Entry> & { sessionNum: number }

interface SessionFormModalProps {
  open: boolean
  onClose: () => void
  formSession: FormSession
  setFormSession: (updater: (prev: FormSession) => FormSession) => void
  formError: string
  setFormError: (e: string) => void
  modelPrediction: number
  onSave: () => Promise<void>
}

export function SessionFormModal({
  open, onClose, formSession, setFormSession,
  formError, setFormError, modelPrediction, onSave,
}: SessionFormModalProps) {
  return (
    <Modal open={open} onClose={onClose} title={`Sesión ${formSession.sessionNum}`}>
      <div className="space-y-4">
        <div className="bg-zinc-800/40 rounded-xl p-3 grid grid-cols-2 gap-3 text-xs">
          <div>
            <p className="text-zinc-500">Modelo predice</p>
            <p className="text-emerald-400 font-bold font-mono text-lg">{modelPrediction} cm</p>
          </div>
          <div className="space-y-1.5">
            <label className="block text-zinc-500">Fecha</label>
            <Input type="date"
              value={formSession.date ?? new Date().toISOString().split('T')[0]}
              onChange={e => setFormSession(p => ({ ...p, date: e.target.value }))} />
          </div>
        </div>

        <Separator className="bg-zinc-800/60" />

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-amber-900/60 border border-amber-700/50 flex items-center justify-center text-[10px] font-bold text-amber-300 shrink-0">A</span>
            <div>
              <p className="text-xs font-semibold text-zinc-300">Estimación visual</p>
              <p className="text-xs text-zinc-600">Antes de medir, ¿cuánto crees que mide?</p>
            </div>
          </div>
          <Input type="number" step="0.1" value={formSession.myPrediction ?? ''}
            onChange={e => { setFormError(''); setFormSession(p => ({ ...p, myPrediction: parseFloat(e.target.value) || null })) }}
            placeholder="cm" className="border-amber-900/40" />
        </div>

        <Separator className="bg-zinc-800/60" />

        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-emerald-900/60 border border-emerald-700/50 flex items-center justify-center text-[10px] font-bold text-emerald-300 shrink-0">B</span>
            <div>
              <p className="text-xs font-semibold text-zinc-300">Medición real + datos del sensor</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2 space-y-1.5">
              <Label className="text-emerald-400">Tamaño real (cm) *</Label>
              <Input type="number" step="0.1" placeholder="Ej: 5.2"
                value={formSession.realHeight ?? ''}
                onChange={e => { setFormError(''); setFormSession(p => ({ ...p, realHeight: parseFloat(e.target.value) || null })) }}
                className="border-emerald-900/40" />
            </div>
            <div className="space-y-1.5">
              <Label>Temperatura °C</Label>
              <Input type="number" step="0.1" placeholder="15.5"
                value={formSession.temperature ?? ''}
                onChange={e => setFormSession(p => ({ ...p, temperature: parseFloat(e.target.value) || null }))} />
            </div>
            <div className="space-y-1.5">
              <Label>Humedad %</Label>
              <Input type="number" step="1" placeholder="64"
                value={formSession.humidity ?? ''}
                onChange={e => setFormSession(p => ({ ...p, humidity: parseFloat(e.target.value) || null }))} />
            </div>
            <div className="col-span-2 space-y-1.5">
              <Label>Horas de luz recibidas</Label>
              <Input type="number" step="0.5" placeholder="11"
                value={formSession.lightHours ?? ''}
                onChange={e => setFormSession(p => ({ ...p, lightHours: parseFloat(e.target.value) || null }))} />
            </div>
            <div className="col-span-2 space-y-1.5">
              <Label>¿Por qué creció así?</Label>
              <Input placeholder="Frío, nublado, soleado..."
                value={formSession.note ?? ''}
                onChange={e => setFormSession(p => ({ ...p, note: e.target.value }))} />
            </div>
          </div>
        </div>

        {formError && (
          <div className="bg-red-950/30 border border-red-900/50 text-red-400 text-xs p-3 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" /> {formError}
          </div>
        )}

        <div className="flex gap-2 pt-1">
          <Button variant="outline" onClick={onClose} className="flex-1">Cancelar</Button>
          <Button onClick={onSave} className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white">
            <Save className="w-4 h-4" /> Guardar
          </Button>
        </div>
      </div>
    </Modal>
  )
}
