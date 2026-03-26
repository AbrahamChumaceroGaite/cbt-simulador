import { prisma } from '@/lib/prisma'

export class EntryService {
  static async getEntriesBySimulation(simulationId: string) {
    return await prisma.entry.findMany({
      where: { simulationId },
      orderBy: { sessionNum: 'asc' },
    })
  }

  static async upsertEntry(data: any) {
    if (!data.simulationId || !data.sessionNum) {
      throw new Error('simulationId y sessionNum requeridos')
    }

    const existing = await prisma.entry.findFirst({ 
      where: { simulationId: data.simulationId, sessionNum: data.sessionNum } 
    })

    const payload = {
      simulationId: data.simulationId,
      sessionNum: data.sessionNum,
      date: data.date ? new Date(data.date) : new Date(),
      myPrediction: data.myPrediction ?? null,
      realHeight: data.realHeight ?? null,
      temperature: data.temperature ?? null,
      humidity: data.humidity ?? null,
      lightHours: data.lightHours ?? null,
      note: data.note ?? '',
    }

    if (existing) {
      return await prisma.entry.update({ where: { id: existing.id }, data: payload })
    } else {
      return await prisma.entry.create({ data: payload })
    }
  }
}
