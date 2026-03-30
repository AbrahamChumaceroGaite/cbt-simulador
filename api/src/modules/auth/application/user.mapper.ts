import type { UserEntity }   from '../domain/user.entity'
import type { SessionPayload } from '@simulador/shared'

export class UserMapper {
  static toSession(entity: UserEntity): SessionPayload {
    return {
      userId:   entity.id,
      role:     entity.role as import('@simulador/shared').PlantasRole,
      code:     entity.code,
      fullName: entity.fullName,
    }
  }
}
