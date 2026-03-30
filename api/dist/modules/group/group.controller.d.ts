import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateGroupDto } from './application/commands/create-group.command';
import { UpdateGroupDto } from './application/commands/update-group.command';
import type { GroupResponse } from '@simulador/shared';
export declare class GroupController {
    private readonly qb;
    private readonly cb;
    constructor(qb: QueryBus, cb: CommandBus);
    getAll(): Promise<GroupResponse[]>;
    getOne(id: string): Promise<GroupResponse>;
    create(dto: CreateGroupDto): Promise<GroupResponse>;
    update(id: string, dto: UpdateGroupDto): Promise<GroupResponse>;
    remove(id: string): Promise<void>;
}
