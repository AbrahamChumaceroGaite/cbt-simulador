import { Controller, Get, Res, UseGuards } from '@nestjs/common'
import type { Response }                   from 'express'
import { BackupService }                   from './backup.service'
import { JwtAuthGuard }                    from '../../common/guards/jwt-auth.guard'
import { AdminGuard }                      from '../../common/guards/admin.guard'

@Controller('backup')
@UseGuards(JwtAuthGuard, AdminGuard)
export class BackupController {
  constructor(private readonly svc: BackupService) {}

  @Get()
  async download(@Res() res: Response): Promise<void> {
    const payload  = await this.svc.export()
    const date     = new Date().toISOString().split('T')[0]
    const filename = `backup-plantas-${date}.json`
    res.setHeader('Content-Type', 'application/json')
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)
    res.send(JSON.stringify(payload, null, 2))
  }
}
