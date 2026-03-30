export type EntryResponse = {
    id: string;
    simulationId: string;
    sessionNum: number;
    date: string;
    myPrediction: number | null;
    realHeight: number | null;
    temperature: number | null;
    humidity: number | null;
    lightHours: number | null;
    note: string;
};
export type EntryInput = {
    simulationId: string;
    sessionNum: number;
    date?: string;
    myPrediction?: number | null;
    realHeight?: number | null;
    temperature?: number | null;
    humidity?: number | null;
    lightHours?: number | null;
    note?: string;
};
