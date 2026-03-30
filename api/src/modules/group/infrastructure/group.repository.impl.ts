import { Injectable }     from '@nestjs/common'
import { PrismaService }  from '../../../infrastructure/prisma/prisma.service'
import { GroupRepository } from '../domain/group.repository'
import type { GroupEntity } from '../domain/group.entity'
import type { GroupInput }  from '@simulador/shared'
import { generateCode }  from '../application/group.utils'

@Injectable()
export class GroupRepositoryImpl extends GroupRepository {
  constructor(private readonly prisma: PrismaService) { super() }

  findAll(): Promise<GroupEntity[]> {
    return this.prisma.group.findMany({
      include: { _count: { select: { simulations: true, members: true } } },
      orderBy: { createdAt: 'desc' },
    }) as unknown as Promise<GroupEntity[]>
  }

  findById(id: string): Promise<GroupEntity | null> {
    return this.prisma.group.findUnique({
      where: { id },
      include: {
        simulations: {
          include: { _count: { select: { entries: true } }, entries: { orderBy: { sessionNum: 'desc' }, take: 1 } },
          orderBy:  { createdAt: 'asc' },
        },
      },
    }) as unknown as Promise<GroupEntity | null>
  }

  findByCode(code: string): Promise<GroupEntity | null> {
    return this.prisma.group.findUnique({
      where: { code: code.toUpperCase() },
      include: { _count: { select: { simulations: true } } },
    }) as unknown as Promise<GroupEntity | null>
  }

  async create(data: GroupInput): Promise<GroupEntity> {
    let code = generateCode()
    while (await this.prisma.group.findUnique({ where: { code } })) {
      code = generateCode()
    }
    return this.prisma.group.create({ data: { ...data, code } }) as unknown as Promise<GroupEntity>
  }

  update(id: string, data: Partial<GroupInput>): Promise<GroupEntity> {
    return this.prisma.group.update({ where: { id }, data }) as unknown as Promise<GroupEntity>
  }

  async delete(id: string): Promise<void> {
    await this.prisma.group.delete({ where: { id } })
  }
}
