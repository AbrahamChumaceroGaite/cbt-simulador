import type { MemberEntity } from './member.entity'
import type { MemberInput }  from '@simulador/shared'

export abstract class MemberRepository {
  abstract findByGroup(groupId: string): Promise<MemberEntity[]>
  abstract create(groupId: string, data: MemberInput): Promise<MemberEntity>
  abstract update(id: string, data: MemberInput): Promise<MemberEntity>
  abstract delete(id: string): Promise<void>
}
