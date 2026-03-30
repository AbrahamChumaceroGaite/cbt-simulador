import { IQueryHandler, QueryHandler } from '@nestjs/cqrs'
import { NotFoundException }           from '@nestjs/common'
import { GroupRepository }             from '../../domain/group.repository'
import type { GroupResponse }          from '@simulador/shared'

export class GetGroupQuery {
  constructor(public readonly id: string) {}
}

@QueryHandler(GetGroupQuery)
export class GetGroupHandler implements IQueryHandler<GetGroupQuery, GroupResponse> {
  constructor(private readonly repo: GroupRepository) {}

  async execute({ id }: GetGroupQuery): Promise<GroupResponse> {
    const entity = await this.repo.findById(id)
    if (!entity) throw new NotFoundException('Grupo no encontrado')
    return entity as unknown as GroupResponse
  }
}
