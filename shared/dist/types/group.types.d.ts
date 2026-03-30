import type { SimulationResponse } from './simulation.types';
export type GroupResponse = {
    id: string;
    name: string;
    course: string;
    plant: string;
    code: string;
    createdAt: string;
    _count?: {
        simulations: number;
        members: number;
    };
    simulations?: SimulationResponse[];
};
export type GroupInput = {
    name: string;
    course: string;
    plant: string;
};
