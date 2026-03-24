import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export interface GrowthParams {
  initialHeight: number
  baseGrowth: number
  optimalTemp: number
  optimalHumidity: number
  optimalLight: number
}

export interface DayConditions {
  temperature: number
  humidity: number
  lightHours: number
}

/**
 * Returns 0–1 effect of each variable on daily growth.
 * Displayed as % to students (0.78 → "78%")
 */
export function calcEffects(params: GrowthParams, cond: DayConditions) {
  const tempEffect = Math.max(0, 1 - Math.abs(cond.temperature - params.optimalTemp) / 10)
  const humEffect  = Math.max(0, 1 - Math.abs(cond.humidity - params.optimalHumidity) / 40)
  const lightEffect = Math.min(1, cond.lightHours / params.optimalLight)
  return { tempEffect, humEffect, lightEffect }
}

export function calcDailyGrowth(params: GrowthParams, cond: DayConditions): number {
  const { tempEffect, humEffect, lightEffect } = calcEffects(params, cond)
  return params.baseGrowth * tempEffect * humEffect * lightEffect
}

export function calcHeightAtDay(params: GrowthParams, days: number, cond: DayConditions): number {
  const daily = calcDailyGrowth(params, cond)
  return params.initialHeight + daily * days
}

/**
 * Generate projected height curve using Tarija seasonal averages.
 * Returns array of {day, height, tempEffect, lightEffect, humEffect}
 */
export const TARIJA_BY_MONTH: Record<number, DayConditions> = {
  1:  { temperature: 19.2, humidity: 72, lightHours: 13.5 },
  2:  { temperature: 19.0, humidity: 74, lightHours: 13.1 },
  3:  { temperature: 17.8, humidity: 70, lightHours: 12.2 },
  4:  { temperature: 15.9, humidity: 65, lightHours: 11.5 },
  5:  { temperature: 13.4, humidity: 60, lightHours: 10.9 },
  6:  { temperature: 11.2, humidity: 55, lightHours: 10.5 },
  7:  { temperature: 11.0, humidity: 53, lightHours: 10.7 },
  8:  { temperature: 13.1, humidity: 56, lightHours: 11.4 },
  9:  { temperature: 15.5, humidity: 62, lightHours: 12.1 },
  10: { temperature: 17.2, humidity: 66, lightHours: 12.8 },
  11: { temperature: 18.5, humidity: 70, lightHours: 13.4 },
  12: { temperature: 19.1, humidity: 72, lightHours: 13.6 },
}

export function generateProjection(params: GrowthParams, startDate: Date, totalDays = 45) {
  const result = []
  for (let d = 0; d <= totalDays; d++) {
    const date = new Date(startDate)
    date.setDate(date.getDate() + d)
    const month = date.getMonth() + 1
    const cond = TARIJA_BY_MONTH[month] ?? TARIJA_BY_MONTH[3]
    const effects = calcEffects(params, cond)
    const daily = params.baseGrowth * effects.tempEffect * effects.humEffect * effects.lightEffect
    const height = parseFloat((params.initialHeight + daily * d).toFixed(2))
    result.push({ day: d, height, date: date.toISOString().split('T')[0], cond, effects })
  }
  return result
}

export function generateCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

export function pct(v: number) {
  return Math.round(v * 100)
}

export function round1(v: number) {
  return Math.round(v * 10) / 10
}

export function formatDate(d: Date | string) {
  return new Date(d).toLocaleDateString('es-BO', { day: '2-digit', month: '2-digit' })
}
