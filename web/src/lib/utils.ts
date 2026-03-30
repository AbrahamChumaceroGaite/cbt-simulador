import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
export { calcEffects, calcDailyGrowth, calcHeightAtDay, generateProjectionFromClimate } from '@simulador/shared'

// ── Date helpers (shared across simulation components) ────────────────────────
export const MN  = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']
export const MNS = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic']

export function datePlus(year: number, month: number, days: number): Date {
  return new Date(year, month - 1, 1 + days)
}
export function fmtDate(d: Date): string {
  return `${d.getDate()} ${MNS[d.getMonth()]} ${d.getFullYear()}`
}
export function fmtShort(d: Date): string {
  return `${d.getDate()} ${MNS[d.getMonth()]}`
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

export function pct(v: number) { return Math.round(v * 100) }
export function round1(v: number) { return Math.round(v * 10) / 10 }
export function formatDate(d: Date | string) {
  return new Date(d).toLocaleDateString('es-BO', { day: '2-digit', month: '2-digit' })
}
