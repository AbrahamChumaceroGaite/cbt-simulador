import type { UserEntity } from './user.entity'

export abstract class UserRepository {
  abstract findByCode(code: string): Promise<UserEntity | null>
}
