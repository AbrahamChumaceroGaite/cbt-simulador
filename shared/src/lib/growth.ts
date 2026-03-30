export interface GrowthParams {
  initialHeight:   number
  baseGrowth:      number
  optimalTemp:     number
  optimalHumidity: number
  optimalLight:    number
}

export interface DayConditions {
  temperature: number
  humidity:    number
  lightHours:  number
}

/** Unified projection point — height is null when climate data is missing for that day */
export type ProjPoint = { day: number; height: number | null; hasData: boolean }

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

/**
 * Projection using real/forecast daily climate data from the API.
 * Returns null for height on days where climate data is missing.
 */
export function generateProjectionFromClimate(
  params: GrowthParams,
  climateDays: (DayConditions | null)[],
  startIdx: number,
  totalDays: number,
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
