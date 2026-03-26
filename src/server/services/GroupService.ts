import { prisma } from '@/lib/prisma'
import { generateCode } from '@/lib/utils'

export class GroupService {
  static async getAllGroups() {
    return await prisma.group.findMany({
      include: { _count: { select: { simulations: true, members: true } } },
      orderBy: { createdAt: 'desc' },
    })
  }

  static async createGroup(data: { name: string; course: string; plant: string }) {
    if (!data.name || !data.course || !data.plant) {
      throw new Error('Faltan campos')
    }

    let code = generateCode()
    while (await prisma.group.findUnique({ where: { code } })) {
      code = generateCode()
    }

    return await prisma.group.create({
      data: { name: data.name, course: data.course, plant: data.plant, code },
    })
  }

  static async getGroupById(id: string) {
    return await prisma.group.findUnique({
      where: { id },
      include: {
        simulations: {
          include: { _count: { select: { entries: true } }, entries: { orderBy: { sessionNum: 'desc' }, take: 1 } },
          orderBy: { createdAt: 'asc' },
        },
      },
    })
  }

  static async getGroupByCode(code: string) {
    return await prisma.group.findUnique({
      where: { code: code.toUpperCase() },
      include: { _count: { select: { simulations: true } } },
    })
  }

  static async updateGroup(id: string, data: any) {
    return await prisma.group.update({ where: { id }, data })
  }

  static async deleteGroup(id: string) {
    return await prisma.group.delete({ where: { id } })
  }
}
