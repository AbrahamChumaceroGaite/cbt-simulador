import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateSimulationDto } from './application/commands/create-simulation.command';
import { UpdateSimulationDto } from './application/commands/update-simulation.command';
import type { SimulationResponse } from '@simulador/shared';
export declare class SimulationController {
    private readonly qb;
    private readonly cb;
    constructor(qb: QueryBus, cb: CommandBus);
    getAll(groupId?: string): Promise<SimulationResponse[]>;
    getOne(id: string): Promise<SimulationResponse>;
    create(dto: CreateSimulationDto): Promise<SimulationResponse>;
    update(id: string, dto: UpdateSimulationDto): Promise<SimulationResponse>;
    remove(id: string): Promise<void>;
}
