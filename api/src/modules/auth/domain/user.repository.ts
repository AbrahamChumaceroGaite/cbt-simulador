import type { UserEntity } from './user.entity'

export abstract class UserRepository {
  abstract findAll():                                    Promise<UserEntity[]>
  abstract findById(id: string):                        Promise<UserEntity | null>
  abstract findByCode(code: string):                    Promise<UserEntity | null>
  abstract create(data: Omit<UserEntity, 'id' | 'createdAt'> & { id?: string }): Promise<UserEntity>
  abstract update(id: string, data: Partial<Pick<UserEntity, 'fullName' | 'passwordHash' | 'isActive'>>): Promise<UserEntity>
  abstract delete(id: string):                          Promise<void>
}
