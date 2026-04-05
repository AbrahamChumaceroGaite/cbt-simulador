'use client'
import { Button, Input, Label, Combobox } from '@/components/ui'

interface GroupFormProps {
  form: { name: string; course: string; plant: string }
  setForm: (f: (prev: { name: string; course: string; plant: string }) => { name: string; course: string; plant: string }) => void
  onCancel: () => void
  onSave: () => void
  saving: boolean
}

const COURSE_OPTS = ['S2A', 'S2B', 'S2C'].map(c => ({ value: c, label: c }))
const PLANT_OPTS  = ['Lechuga', 'Tomate', 'Tomate Cherry'].map(p => ({ value: p, label: p }))

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
          <Combobox
            value={form.course}
            onChange={v => setForm(p => ({ ...p, course: v }))}
            options={COURSE_OPTS}
          />
        </div>
        <div className="space-y-1.5">
          <Label>Planta</Label>
          <Combobox
            value={form.plant}
            onChange={v => setForm(p => ({ ...p, plant: v }))}
            options={PLANT_OPTS}
          />
        </div>
      </div>
      <div className="flex gap-2 pt-1">
        <Button variant="outline" onClick={onCancel} className="flex-1">Cancelar</Button>
        <Button onClick={onSave} disabled={saving || !form.name.trim()} loading={saving} className="flex-1">
          Guardar
        </Button>
      </div>
    </div>
  )
}
