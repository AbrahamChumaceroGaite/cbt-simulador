import type { Response } from 'express';
import { BackupService } from './backup.service';
export declare class BackupController {
    private readonly svc;
    constructor(svc: BackupService);
    download(res: Response): Promise<void>;
}
