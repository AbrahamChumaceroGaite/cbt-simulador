import { ICommandHandler } from '@nestjs/cqrs';
import { UserRepository } from '../../domain/user.repository';
import { GroupRepository } from '../../../group/domain/group.repository';
import type { SessionPayload } from '@simulador/shared';
export declare const COOKIE_NAME = "cbt_plants_session";
export declare class LoginDto {
    code: string;
    password?: string;
    mode?: string;
}
export declare class LoginCommand {
    readonly dto: LoginDto;
    constructor(dto: LoginDto);
}
export declare class LoginHandler implements ICommandHandler<LoginCommand, {
    token: string;
    user: SessionPayload;
}> {
    private readonly userRepo;
    private readonly groupRepo;
    constructor(userRepo: UserRepository, groupRepo: GroupRepository);
    execute({ dto }: LoginCommand): Promise<{
        token: string;
        user: SessionPayload;
    }>;
}
