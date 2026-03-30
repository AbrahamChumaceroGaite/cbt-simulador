import type { GroupEntity }   from '../domain/group.entity'
import type { GroupResponse } from '@simulador/shared'

export class GroupMapper {
  static toResponse(entity: GroupEntity): GroupResponse {
    return {
      id:        entity.id,
      name:      entity.name,
      course:    entity.course,
      plant:     entity.plant,
      code:      entity.code,
      createdAt: entity.createdAt instanceof Date ? entity.createdAt.toISOString() : entity.createdAt,
      _count:    entity._count,
    }
  }
}
