import { Controller, Get, Req, UseGuards } from '@nestjs/common'
import { MonitoreoService }  from './monitoreo.service'
import { JwtAuthGuard }      from '../../common/guards/jwt-auth.guard'
import { ResponseMessage }   from '../../common/decorators/response-message.decorator'
import type { SessionPayload } from '@simulador/shared'

@Controller('monitoreo')
@UseGuards(JwtAuthGuard)
export class MonitoreoController {
  constructor(private readonly svc: MonitoreoService) {}

  @Get()
  @ResponseMessage('Datos de monitoreo obtenidos')
  getData(@Req() req: { user: SessionPayload }) {
    if (req.user.role === 'admin') return this.svc.getAll()
    return this.svc.getForGroupId(req.user.groupId!)
  }
}
