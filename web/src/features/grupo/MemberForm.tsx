'use client'
import { Button, Input, Label } from '@/components/ui'

interface MemberFormProps {
  form: { name: string; role: string }
  setForm: (f: (prev: { name: string; role: string }) => { name: string; role: string }) => void
  onCancel: () => void
  onSave: () => void
  saving: boolean
}

export function MemberForm({ form, setForm, onCancel, onSave, saving }: MemberFormProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label>Nombre completo</Label>
        <Input
          placeholder="Ej: María García"
          value={form.name}
          onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
          onKeyDown={e => e.key === 'Enter' && onSave()}
          autoFocus
        />
      </div>
      <div className="space-y-1.5">
        <Label>Rol en el grupo <span className="text-zinc-600 normal-case">(opcional)</span></Label>
        <Input
          placeholder="Ej: Líder, Medidor, Registro..."
          value={form.role}
          onChange={e => setForm(p => ({ ...p, role: e.target.value }))}
          onKeyDown={e => e.key === 'Enter' && onSave()}
        />
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
