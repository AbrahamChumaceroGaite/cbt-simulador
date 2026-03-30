import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common'
import { CommandBus, QueryBus }                                                from '@nestjs/cqrs'
import { GetSimulationsQuery }                                                 from './application/queries/get-simulations.query'
import { GetSimulationQuery }                                                  from './application/queries/get-simulation.query'
import { CreateSimulationCommand, CreateSimulationDto }                       from './application/commands/create-simulation.command'
import { UpdateSimulationCommand, UpdateSimulationDto }                       from './application/commands/update-simulation.command'
import { DeleteSimulationCommand }                                             from './application/commands/delete-simulation.command'
import { JwtAuthGuard }                                                        from '../../common/guards/jwt-auth.guard'
import { ResponseMessage }                                                     from '../../common/decorators/response-message.decorator'
import type { SimulationResponse }                                             from '@simulador/shared'

@Controller('simulations')
@UseGuards(JwtAuthGuard)
export class SimulationController {
  constructor(private readonly qb: QueryBus, private readonly cb: CommandBus) {}

  @Get()
  @ResponseMessage('Simulaciones obtenidas')
  getAll(@Query('groupId') groupId?: string): Promise<SimulationResponse[]> {
    return this.qb.execute(new GetSimulationsQuery(groupId))
  }

  @Get(':id')
  @ResponseMessage('Simulación obtenida')
  getOne(@Param('id') id: string): Promise<SimulationResponse> {
    return this.qb.execute(new GetSimulationQuery(id))
  }

  @Post()
  @ResponseMessage('Simulación creada')
  create(@Body() dto: CreateSimulationDto): Promise<SimulationResponse> {
    return this.cb.execute(new CreateSimulationCommand(dto))
  }

  @Put(':id')
  @ResponseMessage('Simulación actualizada')
  update(@Param('id') id: string, @Body() dto: UpdateSimulationDto): Promise<SimulationResponse> {
    return this.cb.execute(new UpdateSimulationCommand(id, dto))
  }

  @Delete(':id')
  @ResponseMessage('Simulación eliminada')
  remove(@Param('id') id: string): Promise<void> {
    return this.cb.execute(new DeleteSimulationCommand(id))
  }
}
