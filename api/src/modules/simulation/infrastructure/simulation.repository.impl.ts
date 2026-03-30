import { Injectable }          from '@nestjs/common'
import { PrismaService }       from '../../../infrastructure/prisma/prisma.service'
import { SimulationRepository } from '../domain/simulation.repository'
import type { SimulationEntity }                     from '../domain/simulation.entity'
import type { SimulationInput, SimulationUpdateInput } from '@simulador/shared'

@Injectable()
export class SimulationRepositoryImpl extends SimulationRepository {
  constructor(private readonly prisma: PrismaService) { super() }

  findByGroup(groupId?: string | null): Promise<SimulationEntity[]> {
    return this.prisma.simulation.findMany({
      where:   groupId ? { groupId } : undefined,
      include: { _count: { select: { entries: true } }, entries: { orderBy: { sessionNum: 'desc' }, take: 1 } },
      orderBy: { createdAt: 'asc' },
    }) as unknown as Promise<SimulationEntity[]>
  }

  findById(id: string): Promise<SimulationEntity | null> {
    return this.prisma.simulation.findUnique({
      where:   { id },
      include: { entries: { orderBy: { sessionNum: 'asc' } }, group: true },
    }) as unknown as Promise<SimulationEntity | null>
  }

  create(data: SimulationInput): Promise<SimulationEntity> {
    return this.prisma.simulation.create({
      data: {
        groupId:         data.groupId,
        name:            data.name,
        description:     data.description     ?? '',
        plantName:       data.plantName       ?? '',
        initialHeight:   data.initialHeight   ?? 2.0,
        baseGrowth:      data.baseGrowth      ?? 0.30,
        optimalTemp:     data.optimalTemp      ?? 18.0,
        optimalHumidity: data.optimalHumidity ?? 65.0,
        optimalLight:    data.optimalLight    ?? 12.0,
      },
      include: { _count: { select: { entries: true } } },
    }) as unknown as Promise<SimulationEntity>
  }

  update(id: string, data: SimulationUpdateInput): Promise<SimulationEntity> {
    return this.prisma.simulation.update({
      where:   { id },
      data,
      include: { entries: { orderBy: { sessionNum: 'asc' } }, group: true },
    }) as unknown as Promise<SimulationEntity>
  }

  async delete(id: string): Promise<void> {
    await this.prisma.simulation.delete({ where: { id } })
  }
}
