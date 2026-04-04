import { Body, Controller, Delete, Get, HttpCode, Param, Post, UseGuards } from '@nestjs/common'
import { CommandBus, QueryBus }                           from '@nestjs/cqrs'
import { GetEntriesQuery }                                from './application/queries/get-entries.query'
import { UpsertEntryCommand, UpsertEntryDto }             from './application/commands/upsert-entry.command'
import { DeleteEntryCommand }                             from './application/commands/delete-entry.command'
import { JwtAuthGuard }                                   from '../../common/guards/jwt-auth.guard'
import { AdminGuard }                                     from '../../common/guards/admin.guard'
import { ResponseMessage }                                from '../../common/decorators/response-message.decorator'
import type { EntryResponse }                             from '@simulador/shared'

@Controller('entries')
@UseGuards(JwtAuthGuard)
export class EntryController {
  constructor(private readonly qb: QueryBus, private readonly cb: CommandBus) {}

  @Get('by-simulation/:simId')
  @ResponseMessage('Mediciones obtenidas')
  getBySimulation(@Param('simId') simId: string): Promise<EntryResponse[]> {
    return this.qb.execute(new GetEntriesQuery(simId))
  }

  @Post()
  @ResponseMessage('Medición guardada')
  upsert(@Body() dto: UpsertEntryDto): Promise<EntryResponse> {
    return this.cb.execute(new UpsertEntryCommand(dto))
  }

  @Delete(':id')
  @HttpCode(200)
  @UseGuards(AdminGuard)
  @ResponseMessage('Sesión eliminada')
  remove(@Param('id') id: string): Promise<void> {
    return this.cb.execute(new DeleteEntryCommand(id))
  }
}
