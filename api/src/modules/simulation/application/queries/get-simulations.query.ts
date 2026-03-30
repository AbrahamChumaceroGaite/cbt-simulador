import { IQueryHandler, QueryHandler } from '@nestjs/cqrs'
import { SimulationRepository }        from '../../domain/simulation.repository'
import { SimulationMapper }            from '../simulation.mapper'
import type { SimulationResponse }     from '@simulador/shared'

export class GetSimulationsQuery {
  constructor(public readonly groupId?: string | null) {}
}

@QueryHandler(GetSimulationsQuery)
export class GetSimulationsHandler implements IQueryHandler<GetSimulationsQuery, SimulationResponse[]> {
  constructor(private readonly repo: SimulationRepository) {}

  async execute({ groupId }: GetSimulationsQuery): Promise<SimulationResponse[]> {
    const entities = await this.repo.findByGroup(groupId)
    return entities.map(SimulationMapper.toResponse)
  }
}
