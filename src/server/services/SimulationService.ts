import { prisma } from '@/lib/prisma'

export class SimulationService {
  static async getSimulationsByGroup(groupId?: string | null) {
    return await prisma.simulation.findMany({
      where: groupId ? { groupId } : undefined,
      include: { _count: { select: { entries: true } }, entries: { orderBy: { sessionNum: 'desc' }, take: 1 } },
      orderBy: { createdAt: 'asc' },
    })
  }

  static async createSimulation(data: any) {
    if (!data.groupId || !data.name) throw new Error('groupId y name requeridos')
    return await prisma.simulation.create({
      data: {
        groupId: data.groupId,
        name: data.name,
        description: data.description ?? '',
        plantName: data.plantName ?? '',
        initialHeight: data.initialHeight ?? 2.0,
        baseGrowth: data.baseGrowth ?? 0.30,
        optimalTemp: data.optimalTemp ?? 18.0,
        optimalHumidity: data.optimalHumidity ?? 65.0,
        optimalLight: data.optimalLight ?? 12.0,
      },
      include: { _count: { select: { entries: true } } },
    })
  }

  static async getSimulationById(id: string) {
    return await prisma.simulation.findUnique({
      where: { id },
      include: { entries: { orderBy: { sessionNum: 'asc' } }, group: true },
    })
  }

  static async updateSimulation(id: string, data: any) {
    return await prisma.simulation.update({
      where: { id },
      data,
      include: { entries: { orderBy: { sessionNum: 'asc' } }, group: true },
    })
  }

  static async deleteSimulation(id: string) {
    return await prisma.simulation.delete({ where: { id } })
  }
}
