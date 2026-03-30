import { ClimateService } from './climate.service';
export declare class ClimateController {
    private readonly svc;
    constructor(svc: ClimateService);
    getClimate(month?: string, year?: string): Promise<{
        days: ({
            temperature: number;
            humidity: number;
            lightHours: number;
            source: string;
        } | null)[];
        summary: object;
    }>;
}
