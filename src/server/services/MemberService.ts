import { prisma } from '@/lib/prisma'

export const MemberService = {
  async getByGroup(groupId: string) {
    return prisma.member.findMany({ where: { groupId }, orderBy: { createdAt: 'asc' } })
  },
  async create(groupId: string, name: string, role: string) {
    return prisma.member.create({ data: { groupId, name: name.trim(), role: role.trim() } })
  },
  async update(id: string, name: string, role: string) {
    return prisma.member.update({ where: { id }, data: { name: name.trim(), role: role.trim() } })
  },
  async delete(id: string) {
    return prisma.member.delete({ where: { id } })
  },
}
