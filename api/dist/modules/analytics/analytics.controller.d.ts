import { AnalyticsService } from './analytics.service';
import type { GroupStatResponse } from '@simulador/shared';
export declare class AnalyticsController {
    private readonly svc;
    constructor(svc: AnalyticsService);
    getStats(): Promise<GroupStatResponse[]>;
}
