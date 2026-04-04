import { IQueryHandler, QueryHandler } from '@nestjs/cqrs'
import { UserRepository }              from '../../domain/user.repository'
import type { UserResponse }           from '@simulador/shared'

export class GetUsersQuery {}

@QueryHandler(GetUsersQuery)
export class GetUsersHandler implements IQueryHandler<GetUsersQuery, UserResponse[]> {
  constructor(private readonly repo: UserRepository) {}

  async execute(): Promise<UserResponse[]> {
    const users = await this.repo.findAll()
    return users.map(u => ({
      id:        u.id,
      code:      u.code,
      role:      u.role as import('@simulador/shared').PlantasRole,
      fullName:  u.fullName,
      isActive:  u.isActive,
      createdAt: u.createdAt.toISOString(),
    }))
  }
}
