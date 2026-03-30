import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { UpsertEntryDto } from './application/commands/upsert-entry.command';
import type { EntryResponse } from '@simulador/shared';
export declare class EntryController {
    private readonly qb;
    private readonly cb;
    constructor(qb: QueryBus, cb: CommandBus);
    getBySimulation(simId: string): Promise<EntryResponse[]>;
    upsert(dto: UpsertEntryDto): Promise<EntryResponse>;
}
