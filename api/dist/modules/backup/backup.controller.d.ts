import type { Response } from 'express';
import { BackupService } from './backup.service';
import type { RestoreResult } from '@simulador/shared';
export declare class BackupController {
    private readonly svc;
    constructor(svc: BackupService);
    download(res: Response, sectionsParam?: string): Promise<void>;
    restore(body: Record<string, any>): Promise<RestoreResult>;
}
