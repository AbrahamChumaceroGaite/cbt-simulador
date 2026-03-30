import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateMemberDto } from './application/commands/create-member.command';
import { UpdateMemberDto } from './application/commands/update-member.command';
import type { MemberResponse } from '@simulador/shared';
export declare class MemberController {
    private readonly qb;
    private readonly cb;
    constructor(qb: QueryBus, cb: CommandBus);
    getByGroup(groupId: string): Promise<MemberResponse[]>;
    create(dto: CreateMemberDto): Promise<MemberResponse>;
    update(id: string, dto: UpdateMemberDto): Promise<MemberResponse>;
    remove(id: string): Promise<void>;
}
