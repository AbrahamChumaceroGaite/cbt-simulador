import { IQueryHandler, QueryHandler } from '@nestjs/cqrs'
import { MemberRepository }            from '../../domain/member.repository'
import { MemberMapper }                from '../member.mapper'
import type { MemberResponse }         from '@simulador/shared'

export class GetMembersQuery {
  constructor(public readonly groupId: string) {}
}

@QueryHandler(GetMembersQuery)
export class GetMembersHandler implements IQueryHandler<GetMembersQuery, MemberResponse[]> {
  constructor(private readonly repo: MemberRepository) {}

  async execute({ groupId }: GetMembersQuery): Promise<MemberResponse[]> {
    const entities = await this.repo.findByGroup(groupId)
    return entities.map(MemberMapper.toResponse)
  }
}
