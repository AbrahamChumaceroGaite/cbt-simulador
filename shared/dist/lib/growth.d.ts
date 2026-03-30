export interface GrowthParams {
    initialHeight: number;
    baseGrowth: number;
    optimalTemp: number;
    optimalHumidity: number;
    optimalLight: number;
}
export interface DayConditions {
    temperature: number;
    humidity: number;
    lightHours: number;
}
/** Unified projection point — height is null when climate data is missing for that day */
export type ProjPoint = {
    day: number;
    height: number | null;
    hasData: boolean;
};
export declare function calcEffects(params: GrowthParams, cond: DayConditions): {
    tempEffect: number;
    humEffect: number;
    lightEffect: number;
};
export declare function calcDailyGrowth(params: GrowthParams, cond: DayConditions): number;
export declare function calcHeightAtDay(params: GrowthParams, days: number, cond: DayConditions): number;
/**
 * Projection using real/forecast daily climate data from the API.
 * Returns null for height on days where climate data is missing.
 */
export declare function generateProjectionFromClimate(params: GrowthParams, climateDays: (DayConditions | null)[], startIdx: number, totalDays: number): ProjPoint[];
