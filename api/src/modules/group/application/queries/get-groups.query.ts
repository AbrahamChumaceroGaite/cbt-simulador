import { IQueryHandler, QueryHandler } from '@nestjs/cqrs'
import { GroupRepository }             from '../../domain/group.repository'
import { GroupMapper }                 from '../group.mapper'
import type { GroupResponse }          from '@simulador/shared'

export class GetGroupsQuery {}

@QueryHandler(GetGroupsQuery)
export class GetGroupsHandler implements IQueryHandler<GetGroupsQuery, GroupResponse[]> {
  constructor(private readonly repo: GroupRepository) {}

  async execute(): Promise<GroupResponse[]> {
    const entities = await this.repo.findAll()
    return entities.map(GroupMapper.toResponse)
  }
}
