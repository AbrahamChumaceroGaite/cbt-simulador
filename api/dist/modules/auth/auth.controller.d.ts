import { CommandBus } from '@nestjs/cqrs';
import type { Response } from 'express';
import { LoginDto } from './application/commands/login.command';
import type { SessionPayload } from '@simulador/shared';
export declare class AuthController {
    private readonly cb;
    constructor(cb: CommandBus);
    login(dto: LoginDto, res: Response): Promise<SessionPayload>;
    logout(res: Response): undefined;
    me(user: SessionPayload): SessionPayload;
}
