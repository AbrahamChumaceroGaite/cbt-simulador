import type { GroupEntity } from './group.entity'
import type { GroupInput }  from '@simulador/shared'

export abstract class GroupRepository {
  abstract findAll(): Promise<GroupEntity[]>
  abstract findById(id: string): Promise<GroupEntity | null>
  abstract findByCode(code: string): Promise<GroupEntity | null>
  abstract create(data: GroupInput): Promise<GroupEntity>
  abstract update(id: string, data: Partial<GroupInput>): Promise<GroupEntity>
  abstract delete(id: string): Promise<void>
}
