import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { TARIJA_BY_MONTH } from '@/data/tarija-climate'
import type { GrowthParams, DayConditions, ProjPoint } from '@/lib/types'

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

export function calcEffects(params: GrowthParams, cond: DayConditions) {
  const tempEffect  = Math.max(0, 1 - Math.abs(cond.temperature - params.optimalTemp) / 10)
  const humEffect   = Math.max(0, 1 - Math.abs(cond.humidity - params.optimalHumidity) / 40)
  const lightEffect = Math.min(1, cond.lightHours / params.optimalLight)
  return { tempEffect, humEffect, lightEffect }
}

export function calcDailyGrowth(params: GrowthParams, cond: DayConditions): number {
  const { tempEffect, humEffect, lightEffect } = calcEffects(params, cond)
  return params.baseGrowth * tempEffect * humEffect * lightEffect
}

export function calcHeightAtDay(params: GrowthParams, days: number, cond: DayConditions): number {
  return params.initialHeight + calcDailyGrowth(params, cond) * days
}

/** Projection using TARIJA_BY_MONTH monthly averages — used as fallback when real climate unavailable. */
export function generateProjection(params: GrowthParams, startDate: Date, totalDays = 45) {
  const result = []
  let height = params.initialHeight
  for (let d = 0; d <= totalDays; d++) {
    if (d === 0) { result.push({ day: 0, height, date: startDate.toISOString().split('T')[0], cond: TARIJA_BY_MONTH[startDate.getMonth() + 1] ?? TARIJA_BY_MONTH[3], effects: calcEffects(params, TARIJA_BY_MONTH[startDate.getMonth() + 1] ?? TARIJA_BY_MONTH[3]) }); continue }
    const date = new Date(startDate); date.setDate(date.getDate() + d)
    const month = date.getMonth() + 1
    const cond = TARIJA_BY_MONTH[month] ?? TARIJA_BY_MONTH[3]
    const effects = calcEffects(params, cond)
    height = parseFloat((height + params.baseGrowth * effects.tempEffect * effects.humEffect * effects.lightEffect).toFixed(2))
    result.push({ day: d, height, date: date.toISOString().split('T')[0], cond, effects })
  }
  return result
}

/**
 * Projection using real daily climate data from the API.
 * Returns null for height on days where climate data is missing.
 */
export function generateProjectionFromClimate(
  params: GrowthParams,
  climateDays: ({ temperature: number; humidity: number; lightHours: number } | null)[],
  startIdx: number,
  totalDays: number
): ProjPoint[] {
  const result: ProjPoint[] = []
  let height = params.initialHeight
  result.push({ day: 0, height, hasData: true })
  for (let d = 1; d <= totalDays; d++) {
    const cd = climateDays[startIdx + d]
    if (!cd) { result.push({ day: d, height: null, hasData: false }); continue }
    const eff = calcEffects(params, cd)
    height = parseFloat((height + params.baseGrowth * eff.tempEffect * eff.humEffect * eff.lightEffect).toFixed(2))
    result.push({ day: d, height, hasData: true })
  }
  return result
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
