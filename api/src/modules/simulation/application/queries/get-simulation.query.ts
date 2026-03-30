import { IQueryHandler, QueryHandler } from '@nestjs/cqrs'
import { NotFoundException }           from '@nestjs/common'
import { SimulationRepository }        from '../../domain/simulation.repository'
import { SimulationMapper }            from '../simulation.mapper'
import type { SimulationResponse }     from '@simulador/shared'

export class GetSimulationQuery {
  constructor(public readonly id: string) {}
}

@QueryHandler(GetSimulationQuery)
export class GetSimulationHandler implements IQueryHandler<GetSimulationQuery, SimulationResponse> {
  constructor(private readonly repo: SimulationRepository) {}

  async execute({ id }: GetSimulationQuery): Promise<SimulationResponse> {
    const entity = await this.repo.findById(id)
    if (!entity) throw new NotFoundException('Simulación no encontrada')
    return SimulationMapper.toResponse(entity)
  }
}
