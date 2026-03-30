import { Injectable }     from '@nestjs/common'
import { PrismaService }  from '../../../infrastructure/prisma/prisma.service'
import { EntryRepository } from '../domain/entry.repository'
import type { EntryEntity } from '../domain/entry.entity'
import type { EntryInput }  from '@simulador/shared'

@Injectable()
export class EntryRepositoryImpl extends EntryRepository {
  constructor(private readonly prisma: PrismaService) { super() }

  findBySimulation(simulationId: string): Promise<EntryEntity[]> {
    return this.prisma.entry.findMany({
      where:   { simulationId },
      orderBy: { sessionNum: 'asc' },
    }) as unknown as Promise<EntryEntity[]>
  }

  async upsert(data: EntryInput): Promise<EntryEntity> {
    const existing = await this.prisma.entry.findFirst({
      where: { simulationId: data.simulationId, sessionNum: data.sessionNum },
    })

    const payload = {
      simulationId: data.simulationId,
      sessionNum:   data.sessionNum,
      date:         data.date ? new Date(data.date) : new Date(),
      myPrediction: data.myPrediction  ?? null,
      realHeight:   data.realHeight    ?? null,
      temperature:  data.temperature   ?? null,
      humidity:     data.humidity      ?? null,
      lightHours:   data.lightHours    ?? null,
      note:         data.note          ?? '',
    }

    if (existing) {
      return this.prisma.entry.update({
        where: { id: existing.id },
        data:  payload,
      }) as unknown as Promise<EntryEntity>
    }

    return this.prisma.entry.create({ data: payload }) as unknown as Promise<EntryEntity>
  }
}
