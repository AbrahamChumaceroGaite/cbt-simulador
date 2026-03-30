import { IQueryHandler, QueryHandler } from '@nestjs/cqrs'
import { EntryRepository }             from '../../domain/entry.repository'
import { EntryMapper }                 from '../entry.mapper'
import type { EntryResponse }          from '@simulador/shared'

export class GetEntriesQuery {
  constructor(public readonly simulationId: string) {}
}

@QueryHandler(GetEntriesQuery)
export class GetEntriesHandler implements IQueryHandler<GetEntriesQuery, EntryResponse[]> {
  constructor(private readonly repo: EntryRepository) {}

  async execute({ simulationId }: GetEntriesQuery): Promise<EntryResponse[]> {
    const entities = await this.repo.findBySimulation(simulationId)
    return entities.map(EntryMapper.toResponse)
  }
}
