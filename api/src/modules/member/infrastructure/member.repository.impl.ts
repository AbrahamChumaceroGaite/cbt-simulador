import { Injectable }       from '@nestjs/common'
import { PrismaService }    from '../../../infrastructure/prisma/prisma.service'
import { MemberRepository } from '../domain/member.repository'
import type { MemberEntity } from '../domain/member.entity'
import type { MemberInput }  from '@simulador/shared'

@Injectable()
export class MemberRepositoryImpl extends MemberRepository {
  constructor(private readonly prisma: PrismaService) { super() }

  findByGroup(groupId: string): Promise<MemberEntity[]> {
    return this.prisma.member.findMany({ where: { groupId }, orderBy: { createdAt: 'asc' } }) as unknown as Promise<MemberEntity[]>
  }

  create(groupId: string, data: MemberInput): Promise<MemberEntity> {
    return this.prisma.member.create({ data: { groupId, name: data.name.trim(), role: (data.role ?? '').trim() } }) as unknown as Promise<MemberEntity>
  }

  update(id: string, data: MemberInput): Promise<MemberEntity> {
    return this.prisma.member.update({ where: { id }, data: { name: data.name.trim(), role: (data.role ?? '').trim() } }) as unknown as Promise<MemberEntity>
  }

  async delete(id: string): Promise<void> {
    await this.prisma.member.delete({ where: { id } })
  }
}
