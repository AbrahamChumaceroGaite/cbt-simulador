import { Controller, Get, Query, UseGuards } from '@nestjs/common'
import { ClimateService }                    from './climate.service'
import { JwtAuthGuard }                      from '../../common/guards/jwt-auth.guard'
import { ResponseMessage }                   from '../../common/decorators/response-message.decorator'

@Controller('climate')
@UseGuards(JwtAuthGuard)
export class ClimateController {
  constructor(private readonly svc: ClimateService) {}

  @Get()
  @ResponseMessage('Clima obtenido')
  getClimate(
    @Query('month') month?: string,
    @Query('year')  year?:  string,
  ) {
    const m = Math.max(1, Math.min(12, parseInt(month ?? '4')))
    const y = parseInt(year ?? String(new Date().getFullYear()))
    return this.svc.getClimate(m, y)
  }
}
