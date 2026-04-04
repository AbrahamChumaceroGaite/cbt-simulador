import { Body, Controller, Get, HttpCode, Post, Query, Res, UseGuards } from '@nestjs/common'
import type { Response }   from 'express'
import { BackupService }   from './backup.service'
import { JwtAuthGuard }    from '../../common/guards/jwt-auth.guard'
import { AdminGuard }      from '../../common/guards/admin.guard'
import { ResponseMessage } from '../../common/decorators/response-message.decorator'
import type { RestoreResult } from '@simulador/shared'

const ALL_SECTIONS = ['groups', 'simulations', 'entries'] as const
type Section = typeof ALL_SECTIONS[number]

@Controller('backup')
@UseGuards(JwtAuthGuard, AdminGuard)
export class BackupController {
  constructor(private readonly svc: BackupService) {}

  @Get()
  async download(@Res() res: Response, @Query('sections') sectionsParam?: string): Promise<void> {
    const sections: Section[] = sectionsParam
      ? (sectionsParam.split(',').map(s => s.trim()).filter(s => ALL_SECTIONS.includes(s as Section)) as Section[])
      : [...ALL_SECTIONS]

    const payload  = await this.svc.export(sections)
    const date     = new Date().toISOString().split('T')[0]
    const filename = `backup-plantas-${date}.json`
    res.setHeader('Content-Type', 'application/json')
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)
    res.send(JSON.stringify(payload, null, 2))
  }

  @Post('restore')
  @HttpCode(200)
  @ResponseMessage('Restauración completada')
  restore(@Body() body: Record<string, any>): Promise<RestoreResult> {
    return this.svc.restore(body)
  }
}
