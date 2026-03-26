'use client'
import { Button, Input, Label, Select } from '@/components/ui'

interface GroupFormProps {
  form: { name: string; course: string; plant: string }
  setForm: (f: (prev: { name: string; course: string; plant: string }) => { name: string; course: string; plant: string }) => void
  onCancel: () => void
  onSave: () => void
  saving: boolean
}

export function GroupForm({ form, setForm, onCancel, onSave, saving }: GroupFormProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label>Nombre del grupo</Label>
        <Input
          placeholder="Ej: Los Botanistas"
          value={form.name}
          onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
          onKeyDown={e => e.key === 'Enter' && onSave()}
          autoFocus
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>Curso</Label>
          <Select value={form.course} onChange={e => setForm(p => ({ ...p, course: e.target.value }))}>
            {['S2A', 'S2B', 'S2C'].map(c => <option key={c}>{c}</option>)}
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Planta</Label>
          <Select value={form.plant} onChange={e => setForm(p => ({ ...p, plant: e.target.value }))}>
            {['Lechuga', 'Tomate', 'Tomate Cherry'].map(p => <option key={p}>{p}</option>)}
          </Select>
        </div>
      </div>
      <div className="flex gap-2 pt-1">
        <Button variant="outline" onClick={onCancel} className="flex-1">Cancelar</Button>
        <Button onClick={onSave} disabled={saving || !form.name.trim()} className="flex-1">
          {saving ? 'Guardando...' : 'Guardar'}
        </Button>
      </div>
    </div>
  )
}
