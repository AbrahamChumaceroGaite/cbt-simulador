import { Controller, Get, UseGuards } from '@nestjs/common'
import { AnalyticsService }            from './analytics.service'
import { JwtAuthGuard }                from '../../common/guards/jwt-auth.guard'
import { AdminGuard }                  from '../../common/guards/admin.guard'
import { ResponseMessage }             from '../../common/decorators/response-message.decorator'
import type { GroupStatResponse }      from '@simulador/shared'

@Controller('analytics')
@UseGuards(JwtAuthGuard, AdminGuard)
export class AnalyticsController {
  constructor(private readonly svc: AnalyticsService) {}

  @Get()
  @ResponseMessage('Estadísticas obtenidas')
  getStats(): Promise<GroupStatResponse[]> {
    return this.svc.getGroupStats()
  }
}
