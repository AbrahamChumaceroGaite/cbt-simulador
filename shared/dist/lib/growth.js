"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calcEffects = calcEffects;
exports.calcDailyGrowth = calcDailyGrowth;
exports.calcHeightAtDay = calcHeightAtDay;
exports.generateProjectionFromClimate = generateProjectionFromClimate;
function calcEffects(params, cond) {
    const tempEffect = Math.max(0, 1 - Math.abs(cond.temperature - params.optimalTemp) / 10);
    const humEffect = Math.max(0, 1 - Math.abs(cond.humidity - params.optimalHumidity) / 40);
    const lightEffect = Math.min(1, cond.lightHours / params.optimalLight);
    return { tempEffect, humEffect, lightEffect };
}
function calcDailyGrowth(params, cond) {
    const { tempEffect, humEffect, lightEffect } = calcEffects(params, cond);
    return params.baseGrowth * tempEffect * humEffect * lightEffect;
}
function calcHeightAtDay(params, days, cond) {
    return params.initialHeight + calcDailyGrowth(params, cond) * days;
}
/**
 * Projection using real/forecast daily climate data from the API.
 * Returns null for height on days where climate data is missing.
 */
function generateProjectionFromClimate(params, climateDays, startIdx, totalDays) {
    const result = [];
    let height = params.initialHeight;
    result.push({ day: 0, height, hasData: true });
    for (let d = 1; d <= totalDays; d++) {
        const cd = climateDays[startIdx + d];
        if (!cd) {
            result.push({ day: d, height: null, hasData: false });
            continue;
        }
        const eff = calcEffects(params, cd);
        height = parseFloat((height + params.baseGrowth * eff.tempEffect * eff.humEffect * eff.lightEffect).toFixed(2));
        result.push({ day: d, height, hasData: true });
    }
    return result;
}
