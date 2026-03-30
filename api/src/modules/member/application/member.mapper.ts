import type { MemberEntity }   from '../domain/member.entity'
import type { MemberResponse } from '@simulador/shared'

export class MemberMapper {
  static toResponse(entity: MemberEntity): MemberResponse {
    return {
      id:        entity.id,
      groupId:   entity.groupId,
      name:      entity.name,
      role:      entity.role,
      createdAt: entity.createdAt instanceof Date ? entity.createdAt.toISOString() : entity.createdAt,
    }
  }
}
