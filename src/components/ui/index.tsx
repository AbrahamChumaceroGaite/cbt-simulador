'use client'
import * as React from 'react'
import { cn } from '@/lib/utils'

// ── Button ────────────────────────────────────────────────────────────────────
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'ghost' | 'outline' | 'destructive' | 'secondary'
  size?: 'sm' | 'md' | 'lg' | 'icon'
}
export function Button({ className, variant = 'default', size = 'md', ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-lg font-medium transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50',
        {
          default: 'bg-white text-zinc-900 hover:bg-zinc-100 active:bg-zinc-200',
          ghost: 'text-zinc-400 hover:text-white hover:bg-zinc-800',
          outline: 'border border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white',
          destructive: 'bg-red-900/40 text-red-400 hover:bg-red-900/60 border border-red-900',
          secondary: 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700',
        }[variant],
        { sm: 'h-8 px-3 text-xs gap-1.5', md: 'h-9 px-4 text-sm gap-2', lg: 'h-11 px-6 text-base gap-2', icon: 'h-9 w-9' }[size],
        className
      )}
      {...props}
    />
  )
}

// ── Card ──────────────────────────────────────────────────────────────────────
export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('rounded-xl border border-zinc-800 bg-zinc-900/50 backdrop-blur', className)} {...props} />
}
export function CardHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('flex flex-col gap-1 p-5 pb-3', className)} {...props} />
}
export function CardTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn('text-base font-semibold text-white leading-tight', className)} {...props} />
}
export function CardDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn('text-sm text-zinc-500', className)} {...props} />
}
export function CardContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('px-5 pb-5', className)} {...props} />
}
export function CardFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('flex items-center px-5 pb-5 pt-0 gap-2', className)} {...props} />
}

// ── Input ─────────────────────────────────────────────────────────────────────
export function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        'flex h-10 w-full rounded-lg border border-zinc-700 bg-zinc-800/50 px-3 py-2 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-white/30 focus:border-zinc-500 disabled:opacity-50',
        className
      )}
      {...props}
    />
  )
}

// ── Label ─────────────────────────────────────────────────────────────────────
export function Label({ className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return <label className={cn('text-xs font-medium text-zinc-400 uppercase tracking-wide', className)} {...props} />
}

// ── Badge ─────────────────────────────────────────────────────────────────────
interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'green' | 'amber' | 'red' | 'blue' | 'demo'
}
export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        {
          default: 'bg-zinc-800 text-zinc-400',
          green: 'bg-emerald-950 text-emerald-400 border border-emerald-900',
          amber: 'bg-amber-950 text-amber-400 border border-amber-900',
          red: 'bg-red-950 text-red-400 border border-red-900',
          blue: 'bg-blue-950 text-blue-400 border border-blue-900',
          demo: 'bg-violet-950 text-violet-400 border border-violet-900',
        }[variant],
        className
      )}
      {...props}
    />
  )
}

// ── Textarea ──────────────────────────────────────────────────────────────────
export function Textarea({ className, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        'flex w-full rounded-lg border border-zinc-700 bg-zinc-800/50 px-3 py-2 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-white/30 focus:border-zinc-500 disabled:opacity-50 resize-none',
        className
      )}
      {...props}
    />
  )
}

// ── Select ────────────────────────────────────────────────────────────────────
export function Select({ className, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        'flex h-10 w-full rounded-lg border border-zinc-700 bg-zinc-800/50 px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-white/30 focus:border-zinc-500',
        className
      )}
      {...props}
    />
  )
}

// ── Slider ────────────────────────────────────────────────────────────────────
interface SliderProps {
  label: string
  value: number
  min: number
  max: number
  step?: number
  unit?: string
  onChange: (v: number) => void
  effectPct?: number
  effectLabel?: string
}
export function SliderField({ label, value, min, max, step = 0.1, unit = '', onChange, effectPct, effectLabel }: SliderProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label>{label}</Label>
        <div className="flex items-center gap-2">
          {effectPct !== undefined && (
            <span className={cn(
              'text-xs font-mono px-2 py-0.5 rounded-full',
              effectPct >= 80 ? 'bg-emerald-950 text-emerald-400' :
              effectPct >= 50 ? 'bg-amber-950 text-amber-400' :
              'bg-red-950 text-red-400'
            )}>{effectPct}%</span>
          )}
          <span className="text-sm font-mono text-white tabular-nums">
            {value}{unit}
          </span>
        </div>
      </div>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(parseFloat(e.target.value))}
        className="w-full h-1.5 bg-zinc-700 rounded-full appearance-none cursor-pointer accent-white"
      />
      {effectLabel && (
        <p className="text-xs text-zinc-500">{effectLabel}</p>
      )}
    </div>
  )
}

// ── Separator ─────────────────────────────────────────────────────────────────
export function Separator({ className }: { className?: string }) {
  return <div className={cn('h-px bg-zinc-800', className)} />
}

// ── Empty State ───────────────────────────────────────────────────────────────
export function EmptyState({ icon, title, description, action }: {
  icon: React.ReactNode; title: string; description?: string; action?: React.ReactNode
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center gap-3">
      <div className="text-zinc-600 mb-1">{icon}</div>
      <p className="text-base font-medium text-zinc-400">{title}</p>
      {description && <p className="text-sm text-zinc-600 max-w-xs">{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  )
}

// ── Modal ─────────────────────────────────────────────────────────────────────
export function Modal({ open, onClose, title, children }: {
  open: boolean; onClose: () => void; title: string; children: React.ReactNode
}) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900 shadow-2xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800">
          <h2 className="text-base font-semibold text-white">{title}</h2>
          <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  )
}
