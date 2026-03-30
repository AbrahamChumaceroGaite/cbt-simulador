import { Module }                   from '@nestjs/common'
import { CqrsModule }               from '@nestjs/cqrs'
import { SimulationController }     from './simulation.controller'
import { GetSimulationsHandler }    from './application/queries/get-simulations.query'
import { GetSimulationHandler }     from './application/queries/get-simulation.query'
import { CreateSimulationHandler }  from './application/commands/create-simulation.command'
import { UpdateSimulationHandler }  from './application/commands/update-simulation.command'
import { DeleteSimulationHandler }  from './application/commands/delete-simulation.command'
import { SimulationRepository }     from './domain/simulation.repository'
import { SimulationRepositoryImpl } from './infrastructure/simulation.repository.impl'
import { PrismaService }            from '../../infrastructure/prisma/prisma.service'

@Module({
  imports:     [CqrsModule],
  controllers: [SimulationController],
  providers:   [
    PrismaService,
    GetSimulationsHandler, GetSimulationHandler,
    CreateSimulationHandler, UpdateSimulationHandler, DeleteSimulationHandler,
    { provide: SimulationRepository, useClass: SimulationRepositoryImpl },
  ],
})
export class SimulationModule {}
